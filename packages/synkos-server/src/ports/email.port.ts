/** Options for arbitrary transactional emails sent outside the auth flows. */
export interface SendCustomEmailOptions {
  /** Recipient address. Single string for backwards compatibility. */
  to: string;
  /** Subject line. */
  subject: string;
  /** HTML body. Adapters that need a plain-text fallback derive it themselves. */
  html: string;
  /** Optional plain-text body. Recommended for deliverability. */
  text?: string;
  /** Optional Reply-To header. */
  replyTo?: string;
  /** Optional extra headers passed through to the provider. */
  headers?: Record<string, string>;
}

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
  /**
   * Send a transactional email outside the framework's auth flows
   * (reminders, alerts, digests, …). Apps build their own HTML and the
   * adapter forwards it to the provider untouched, so the auth-specific
   * branding/templates of the adapter don't leak into product emails.
   */
  sendCustom(options: SendCustomEmailOptions): Promise<void>;
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
