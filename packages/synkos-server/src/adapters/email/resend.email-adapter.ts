import { createLogger } from '@/utils/logger';
import type { EmailPort, EmailTemplates, SendCustomEmailOptions } from '@/ports/email.port';

const log = createLogger('email:resend');

// ── Config ────────────────────────────────────────────────────────────────────

export interface ResendAdapterConfig {
  /** Resend API key. */
  apiKey: string;
  /**
   * The From address used in production.
   * Format: "App Name <address@yourdomain.com>"
   */
  from: string;
  /**
   * The From address used in development (Resend sandbox sender).
   * Defaults to `from` if not provided.
   * Typically "App Name <onboarding@resend.dev>"
   */
  fromDev?: string;
  /**
   * Override the recipient address in development.
   * Resend only allows sending to the account owner's address in sandbox mode.
   * Maps to the RESEND_TEST_TO environment variable.
   */
  devOverrideTo?: string;
  /** Whether the app is running in development mode. Default: false. */
  isDev?: boolean;
  /**
   * App name shown in email headings.
   * Defaults to the name extracted from `from` (the part before the `<`).
   */
  appName?: string;
  /** Brand color used in template headings. Default: "#0A84FF". */
  brandColor?: string;
  /** Override any or all default email templates. */
  templates?: Partial<EmailTemplates>;
}

// ── Default templates ─────────────────────────────────────────────────────────

function buildDefaultTemplates(appName: string, brandColor: string): EmailTemplates {
  const heading = `<h2 style="color:${brandColor};">${appName}</h2>`;

  return {
    verification: (code) => ({
      subject: `Verify your email — ${appName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          ${heading}
          <p>Your email verification code is:</p>
          <div style="font-size:40px;font-weight:700;letter-spacing:12px;margin:24px 0;">${code}</div>
          <p style="color:#888;">This code expires in <strong>24 hours</strong>.</p>
          <p style="color:#888;font-size:13px;">If you didn't create this account, you can safely ignore this email.</p>
        </div>
      `,
    }),

    passwordReset: (code) => ({
      subject: `Password reset code — ${appName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          ${heading}
          <p>Your password reset code is:</p>
          <div style="font-size:40px;font-weight:700;letter-spacing:12px;margin:24px 0;">${code}</div>
          <p style="color:#888;">This code expires in <strong>15 minutes</strong>.</p>
          <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),

    deletionConfirmation: (scheduledAt) => {
      const date = scheduledAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return {
        subject: `Account deletion scheduled — ${appName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
            ${heading}
            <p>We received a request to delete your account.</p>
            <p>Your account and all associated data will be <strong>permanently deleted on ${date}</strong>.</p>
            <p>You can cancel this from within the app before that date.</p>
            <p style="color:#888;font-size:13px;">If you didn't request this, please contact support immediately.</p>
          </div>
        `,
      };
    },

    deletionCancelled: () => ({
      subject: `Account deletion cancelled — ${appName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          ${heading}
          <p>Your account deletion has been <strong>successfully cancelled</strong>.</p>
          <p>Your account is active and all your data remains intact.</p>
          <p style="color:#888;font-size:13px;">If you didn't cancel this deletion, please contact support immediately.</p>
        </div>
      `,
    }),
  };
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export class ResendEmailAdapter implements EmailPort {
  private readonly apiKey: string;
  private readonly from: string;
  private readonly fromDev: string;
  private readonly devOverrideTo?: string;
  private readonly isDev: boolean;
  private readonly templates: EmailTemplates;

  constructor(config: ResendAdapterConfig) {
    this.apiKey = config.apiKey;
    this.from = config.from;
    this.fromDev = config.fromDev ?? config.from;
    this.devOverrideTo = config.devOverrideTo;
    this.isDev = config.isDev ?? false;

    // Extract app name from the `from` string if not explicitly provided.
    // "Grading Center <noreply@app.com>" → "Grading Center"
    const appName = config.appName ?? config.from.split('<')[0].trim();
    const brandColor = config.brandColor ?? '#0A84FF';
    const defaults = buildDefaultTemplates(appName, brandColor);

    this.templates = { ...defaults, ...config.templates };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private resolveRecipient(to: string): string {
    return this.isDev && this.devOverrideTo ? this.devOverrideTo : to;
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    extras: { text?: string; replyTo?: string; headers?: Record<string, string> } = {}
  ): Promise<void> {
    const recipient = this.resolveRecipient(to);
    const from = this.isDev ? this.fromDev : this.from;

    if (this.isDev && recipient !== to) {
      log.debug({ recipient, original: to }, 'Dev override applied');
    }

    const payload: Record<string, unknown> = { from, to: recipient, subject, html };
    if (extras.text) payload.text = extras.text;
    if (extras.replyTo) payload.reply_to = extras.replyTo;
    if (extras.headers) payload.headers = extras.headers;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Resend delivery failed [${res.status}]: ${body}`);
    }
  }

  // ── EmailPort ───────────────────────────────────────────────────────────────

  async sendEmailVerification(to: string, code: string): Promise<void> {
    const { subject, html } = this.templates.verification(code);
    await this.send(to, subject, html);
  }

  async sendPasswordReset(to: string, code: string): Promise<void> {
    const { subject, html } = this.templates.passwordReset(code);
    await this.send(to, subject, html);
  }

  async sendDeletionConfirmation(to: string, scheduledAt: Date): Promise<void> {
    const { subject, html } = this.templates.deletionConfirmation(scheduledAt);
    await this.send(to, subject, html);
  }

  async sendDeletionCancelled(to: string): Promise<void> {
    const { subject, html } = this.templates.deletionCancelled();
    await this.send(to, subject, html);
  }

  async sendCustom(options: SendCustomEmailOptions): Promise<void> {
    await this.send(options.to, options.subject, options.html, {
      text: options.text,
      replyTo: options.replyTo,
      headers: options.headers,
    });
  }
}
