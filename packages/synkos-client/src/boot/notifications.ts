import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import { notificationsService } from '../services/notifications.service.js';
import type {
  PushNotificationHandler,
  PushActionHandler,
} from '../services/notifications.service.js';

interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export interface NotificationsBootOptions {
  /** Custom foreground notification handler. Default: console.log. */
  onNotification?: PushNotificationHandler;
  /**
   * Custom tap/action handler. Default: navigates to `notification.data.screen`
   * with optional `params` and `query`.
   */
  onActionPerformed?: PushActionHandler;
}

export type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>;

export function createNotificationsBoot(options: NotificationsBootOptions = {}): ClientBootFn {
  return async ({ router }) => {
    await notificationsService.init({
      onNotification:
        options.onNotification ??
        ((notification) => {
          console.warn('[notifications] Foreground:', notification.title, notification.body);
        }),

      onActionPerformed:
        options.onActionPerformed ??
        ((action) => {
          const data = (action.notification.data ?? {}) as NotificationData;
          if (!data.screen) return;

          const route: RouteLocationRaw = {
            name: data.screen,
            ...(data.params && { params: data.params }),
            ...(data.query && { query: data.query }),
          };

          void router.push(route);
        }),
    });
  };
}
