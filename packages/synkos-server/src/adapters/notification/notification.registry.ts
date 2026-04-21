import { NoopNotificationAdapter } from './noop.notification-adapter';
import type { NotificationPort } from '@/ports/notification.port';

/**
 * Module-level singleton. Starts with the noop adapter so the app is safe
 * to boot with no push notification configuration — nothing crashes, sends are logged.
 *
 * Projects call setNotificationAdapter() in bootstrap/adapters.ts (imported before
 * any module that could trigger a push send).
 */
let adapter: NotificationPort = new NoopNotificationAdapter();

export function setNotificationAdapter(impl: NotificationPort): void {
  adapter = impl;
}

export function getNotificationAdapter(): NotificationPort {
  return adapter;
}
