/**
 * Contract that every email adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider.
 * Projects provide their implementation via setEmailAdapter() in bootstrap/adapters.ts.
 */
export interface EmailPort {
  sendEmailVerification(to: string, code: string): Promise<void>;
  sendPasswordReset(to: string, code: string): Promise<void>;
  sendDeletionConfirmation(to: string, scheduledAt: Date): Promise<void>;
  sendDeletionCancelled(to: string): Promise<void>;
}

/**
 * Optional template overrides for providers that render HTML locally.
 * Each function receives the data it needs and returns subject + html body.
 * When a template is omitted, the adapter uses its own default.
 */
export interface EmailTemplates {
  verification: (code: string) => { subject: string; html: string };
  passwordReset: (code: string) => { subject: string; html: string };
  deletionConfirmation: (scheduledAt: Date) => { subject: string; html: string };
  deletionCancelled: () => { subject: string; html: string };
}
