import { createLogger } from '@/utils/logger';
import type { NotificationPort, PushPayload } from '@/ports/notification.port';

const log = createLogger('notification:noop');

/**
 * Noop notification adapter — default when no provider is configured.
 *
 * Logs push attempts to the logger instead of sending real notifications.
 * Safe to use in development and tests with no external dependencies.
 */
export class NoopNotificationAdapter implements NotificationPort {
  async sendToDevice(token: string, payload: PushPayload): Promise<void> {
    log.info({ tokenPrefix: token.slice(0, 8), payload }, '🔔 [notification:send]');
  }

  async sendToMany(tokens: string[], payload: PushPayload): Promise<void> {
    log.info({ count: tokens.length, payload }, '🔔 [notification:send-many]');
  }
}
