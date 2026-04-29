import type { EmailPort, SendCustomEmailOptions } from '@synkos/server/ports';

export class CapturingEmailAdapter implements EmailPort {
  verifications: Array<{ to: string; code: string }> = [];
  passwordResets: Array<{ to: string; code: string }> = [];
  deletionConfirmations: Array<{ to: string; scheduledAt: Date }> = [];
  deletionCancellations: Array<{ to: string }> = [];
  customs: SendCustomEmailOptions[] = [];

  reset(): void {
    this.verifications = [];
    this.passwordResets = [];
    this.deletionConfirmations = [];
    this.deletionCancellations = [];
    this.customs = [];
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

  async sendCustom(options: SendCustomEmailOptions): Promise<void> {
    this.customs.push(options);
  }
}

export const capturingEmail = new CapturingEmailAdapter();
