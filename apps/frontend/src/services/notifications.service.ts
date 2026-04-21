import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { appConfig } from 'src/app.config';

export type PushNotificationHandler = (notification: PushNotificationSchema) => void;
export type PushActionHandler = (action: ActionPerformed) => void;

// Keys sourced from app.config to avoid collisions between apps
const PUSH_TOKEN_KEY = appConfig.storageKeys.pushToken;
const PUSH_TOKEN_REGISTERED_KEY = appConfig.storageKeys.pushTokenRegistered;

class NotificationsService {
  private initialized = false;

  /**
   * Initialises the Capacitor push plugin.
   * - Requests OS permission (iOS shows the system dialog once).
   * - Caches the token in Preferences for later registration.
   * - Sets up foreground/tap handlers.
   *
   * Does NOT register the token with the API — call `flushPendingToken()`
   * after the user is authenticated.
   */
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

    // Cache the token locally — registration with the API happens via flushPendingToken()
    void PushNotifications.addListener('registration', (token: Token) => {
      void Preferences.set({ key: PUSH_TOKEN_KEY, value: token.value });
    });

    void PushNotifications.addListener('registrationError', (err) => {
      console.error('[notifications] Registration error:', err.error);
    });

    void PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        opts?.onNotification?.(notification);
      },
    );

    void PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        opts?.onActionPerformed?.(action);
      },
    );

    this.initialized = true;
  }

  /**
   * Registers the cached push token with the backend.
   * Safe to call after every login or session restore — skips the API call
   * if the token hasn't changed since the last successful registration.
   *
   * Fire-and-forget: never throws.
   */
  async flushPendingToken(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const [{ value: token }, { value: registered }] = await Promise.all([
        Preferences.get({ key: PUSH_TOKEN_KEY }),
        Preferences.get({ key: PUSH_TOKEN_REGISTERED_KEY }),
      ]);

      if (!token) return; // permission not granted or token not yet received
      if (token === registered) return; // already registered with the API — nothing to do

      const { UserService } = await import('src/services/user.service');
      await UserService.registerPushToken(token);

      await Preferences.set({ key: PUSH_TOKEN_REGISTERED_KEY, value: token });
    } catch (err) {
      // Non-fatal — will retry on next login/restore
      console.warn('[notifications] flushPendingToken failed:', err);
    }
  }

  /**
   * Removes the push token from the backend and clears the local markers.
   * Call this on logout so the user stops receiving notifications.
   * Fire-and-forget: never throws.
   */
  async unregisterToken(): Promise<void> {
    try {
      const { value: token } = await Preferences.get({ key: PUSH_TOKEN_KEY });

      if (token) {
        const { UserService } = await import('src/services/user.service');
        await UserService.unregisterPushToken(token);
      }
    } catch (err) {
      console.warn('[notifications] unregisterToken failed:', err);
    } finally {
      // Always clear local markers, even if the API call failed
      await Preferences.remove({ key: PUSH_TOKEN_REGISTERED_KEY });
    }
  }

  /**
   * Returns the current OS-level push permission status.
   * 'unavailable' means the app is not running on a native platform.
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> {
    if (!Capacitor.isNativePlatform()) return 'unavailable';
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.checkPermissions();
    return result.receive as 'granted' | 'denied' | 'prompt';
  }

  /**
   * Requests OS permission (if not yet granted) and re-registers the token
   * with the backend. Returns whether push is now active.
   * Call this when the user re-enables notifications in settings.
   */
  async enable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.requestPermissions();

    if (result.receive !== 'granted') return false;

    // Re-register to ensure the token listener fires if not already initialized
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
