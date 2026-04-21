import { defineBoot } from '#q-app/wrappers';
import type { RouteLocationRaw } from 'vue-router';
import { notificationsService } from 'src/services/notifications.service';

/**
 * Shape of the `data` field sent in the APNs payload.
 *
 * Example:
 * { "screen": "cards", "params": { "slug": "scarlet-violet" }, "query": { "highlight": "abc" } }
 */
interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export default defineBoot(async ({ router }) => {
  await notificationsService.init({
    onNotification: (notification) => {
      // Received in foreground — extend here to show an in-app banner if needed
      console.log('[notifications] Foreground:', notification.title, notification.body);
    },

    onActionPerformed: (action) => {
      const data = (action.notification.data ?? {}) as NotificationData;
      if (!data.screen) return;

      const route: RouteLocationRaw = {
        name: data.screen,
        ...(data.params && { params: data.params }),
        ...(data.query && { query: data.query }),
      };

      void router.push(route);
    },
  });
});
