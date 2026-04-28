import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { getClientConfig } from '../internal/app-config.js';

export type PushNotificationHandler = (notification: PushNotificationSchema) => void;
export type PushActionHandler = (action: ActionPerformed) => void;

class NotificationsService {
  private initialized = false;

  async init(opts?: {
    onNotification?: PushNotificationHandler;
    onActionPerformed?: PushActionHandler;
  }): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (this.initialized) return;

    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('[notifications] Push permission not granted:', permResult.receive);
      return;
    }

    await PushNotifications.register();

    const { storageKeys } = getClientConfig();

    void PushNotifications.addListener('registration', (token: Token) => {
      void Preferences.set({ key: storageKeys.pushToken, value: token.value });
    });

    void PushNotifications.addListener('registrationError', (err) => {
      console.error('[notifications] Registration error:', err.error);
    });

    void PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        opts?.onNotification?.(notification);
      }
    );

    void PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        opts?.onActionPerformed?.(action);
      }
    );

    this.initialized = true;
  }

  async flushPendingToken(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const { storageKeys } = getClientConfig();
      const [{ value: token }, { value: registered }] = await Promise.all([
        Preferences.get({ key: storageKeys.pushToken }),
        Preferences.get({ key: storageKeys.pushTokenRegistered }),
      ]);

      if (!token) return;
      if (token === registered) return;

      const { UserService } = await import('../auth/services/user.service.js');
      await UserService.registerPushToken(token);

      await Preferences.set({ key: storageKeys.pushTokenRegistered, value: token });
    } catch (err) {
      console.warn('[notifications] flushPendingToken failed:', err);
    }
  }

  async unregisterToken(): Promise<void> {
    try {
      const { storageKeys } = getClientConfig();
      const { value: token } = await Preferences.get({ key: storageKeys.pushToken });

      if (token) {
        const { UserService } = await import('../auth/services/user.service.js');
        await UserService.unregisterPushToken(token);
      }
    } catch (err) {
      console.warn('[notifications] unregisterToken failed:', err);
    } finally {
      const { storageKeys } = getClientConfig();
      await Preferences.remove({ key: storageKeys.pushTokenRegistered });
    }
  }

  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
    if (!Capacitor.isNativePlatform()) return 'unavailable';
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.checkPermissions();
    return result.receive as 'granted' | 'denied' | 'prompt';
  }

  async enable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.requestPermissions();

    if (result.receive !== 'granted') return false;

    await PushNotifications.register();
    await this.flushPendingToken();
    return true;
  }

  async getDeliveredNotifications() {
    if (!Capacitor.isNativePlatform()) return [];
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }

  async removeAllDeliveredNotifications() {
    if (!Capacitor.isNativePlatform()) return;
    const { PushNotifications } = await import('@capacitor/push-notifications');
    await PushNotifications.removeAllDeliveredNotifications();
  }
}

export const notificationsService = new NotificationsService();
