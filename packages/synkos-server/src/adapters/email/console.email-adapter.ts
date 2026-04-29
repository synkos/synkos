import { createLogger } from '@/utils/logger';
import type { EmailPort, SendCustomEmailOptions } from '@/ports/email.port';

const log = createLogger('email:console');

/**
 * Console email adapter — default when no provider is configured.
 *
 * Prints email data to the logger instead of sending real messages.
 * Safe to use in development and tests with no external dependencies.
 */
export class ConsoleEmailAdapter implements EmailPort {
  async sendEmailVerification(to: string, code: string): Promise<void> {
    log.info({ to, code }, '📧 [email:verification]');
  }

  async sendPasswordReset(to: string, code: string): Promise<void> {
    log.info({ to, code }, '📧 [email:password-reset]');
  }

  async sendDeletionConfirmation(to: string, scheduledAt: Date): Promise<void> {
    log.info({ to, scheduledAt }, '📧 [email:deletion-confirmation]');
  }

  async sendDeletionCancelled(to: string): Promise<void> {
    log.info({ to }, '📧 [email:deletion-cancelled]');
  }

  async sendCustom(options: SendCustomEmailOptions): Promise<void> {
    log.info(
      {
        to: options.to,
        subject: options.subject,
        replyTo: options.replyTo,
        htmlBytes: options.html.length,
      },
      '📧 [email:custom]'
    );
  }
}
