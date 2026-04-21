import type { EmailPort } from '@synkos/server/ports';

/**
 * In-memory email adapter that captures every send call.
 *
 * Wire it via setEmailAdapter(capturingEmail) after wireAdapters() so tests
 * can inspect sent codes without touching an external provider.
 *
 * Call capturingEmail.reset() in beforeEach to prevent bleed between tests.
 */
export class CapturingEmailAdapter implements EmailPort {
  verifications: Array<{ to: string; code: string }> = [];
  passwordResets: Array<{ to: string; code: string }> = [];
  deletionConfirmations: Array<{ to: string; scheduledAt: Date }> = [];
  deletionCancellations: Array<{ to: string }> = [];

  reset(): void {
    this.verifications = [];
    this.passwordResets = [];
    this.deletionConfirmations = [];
    this.deletionCancellations = [];
  }

  async sendEmailVerification(to: string, code: string): Promise<void> {
    this.verifications.push({ to, code });
  }

  async sendPasswordReset(to: string, code: string): Promise<void> {
    this.passwordResets.push({ to, code });
  }

  async sendDeletionConfirmation(to: string, scheduledAt: Date): Promise<void> {
    this.deletionConfirmations.push({ to, scheduledAt });
  }

  async sendDeletionCancelled(to: string): Promise<void> {
    this.deletionCancellations.push({ to });
  }
}

export const capturingEmail = new CapturingEmailAdapter();
