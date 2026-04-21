/**
 * APNs (Apple Push Notification service) adapter — provider-token auth (no cert needed).
 *
 * Uses the built-in `node:http2` and `node:crypto` so no extra dependencies
 * are required. The provider token (JWT signed with ES256) is cached and
 * regenerated every 55 minutes (Apple invalidates them after 60 min).
 *
 * Required config:
 *   keyP8      — full content of the .p8 file (with -----BEGIN/END PRIVATE KEY-----)
 *   keyId      — 10-char key ID from Apple Developer
 *   teamId     — 10-char Team ID from Apple Developer
 *   bundleId   — bundle identifier of the app (e.g. com.example.app)
 *   production — true for api.push.apple.com, false for sandbox
 */

import http2 from "node:http2";
import crypto from "node:crypto";
import { createLogger } from "@/utils/logger";
import type { NotificationPort, PushPayload } from "@/ports/notification.port";

const log = createLogger("notification:apns");

export interface ApnsAdapterConfig {
  keyP8: string;
  keyId: string;
  teamId: string;
  bundleId: string;
  production: boolean;
}

export class ApnsNotificationAdapter implements NotificationPort {
  private readonly config: ApnsAdapterConfig;
  private readonly host: string;

  private cachedToken: string | null = null;
  private cachedTokenGeneratedAt = 0;
  private readonly TOKEN_TTL_MS = 55 * 60 * 1000; // 55 min

  private h2Session: http2.ClientHttp2Session | null = null;

  constructor(config: ApnsAdapterConfig) {
    this.config = config;
    this.host = config.production
      ? "api.push.apple.com"
      : "api.sandbox.push.apple.com";
  }

  // ── Provider token ────────────────────────────────────────────────────────────

  private generateProviderToken(): string {
    const { keyP8, keyId, teamId } = this.config;

    const header  = Buffer.from(JSON.stringify({ alg: "ES256", kid: keyId })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
    const signingInput = `${header}.${payload}`;

    const sign = crypto.createSign("SHA256");
    sign.update(signingInput);
    sign.end();

    const signature = sign
      .sign({ key: keyP8, dsaEncoding: "ieee-p1363" })
      .toString("base64url");

    return `${signingInput}.${signature}`;
  }

  private getProviderToken(): string {
    const now = Date.now();
    if (!this.cachedToken || now - this.cachedTokenGeneratedAt > this.TOKEN_TTL_MS) {
      this.cachedToken = this.generateProviderToken();
      this.cachedTokenGeneratedAt = now;
    }
    return this.cachedToken;
  }

  // ── HTTP/2 session ────────────────────────────────────────────────────────────

  private getH2Session(): http2.ClientHttp2Session {
    if (this.h2Session && !this.h2Session.destroyed && !this.h2Session.closed) {
      return this.h2Session;
    }

    this.h2Session = http2.connect(`https://${this.host}`);
    this.h2Session.on("error", () => {
      this.h2Session?.destroy();
      this.h2Session = null;
    });

    return this.h2Session;
  }

  // ── NotificationPort ──────────────────────────────────────────────────────────

  async sendToDevice(token: string, payload: PushPayload): Promise<void> {
    const body = JSON.stringify({
      aps: {
        alert: { title: payload.title, body: payload.body },
        badge: payload.badge,
        sound: payload.sound ?? "default",
      },
      ...payload.data,
    });

    return new Promise((resolve, reject) => {
      const session = this.getH2Session();

      const req = session.request({
        ":method":        "POST",
        ":path":          `/3/device/${token}`,
        authorization:    `bearer ${this.getProviderToken()}`,
        "apns-topic":     this.config.bundleId,
        "apns-push-type": "alert",
        "content-type":   "application/json",
        "content-length": Buffer.byteLength(body),
      });

      req.write(body);
      req.end();

      req.on("response", (headers) => {
        const status = headers[":status"];

        if (status === 200) {
          req.close();
          resolve();
          return;
        }

        let raw = "";
        req.on("data", (chunk: Buffer) => (raw += chunk.toString()));
        req.on("end", () => {
          try {
            const parsed = JSON.parse(raw) as { reason?: string };
            reject(new Error(`APNs error ${status}: ${parsed.reason ?? raw}`));
          } catch {
            reject(new Error(`APNs error ${status}: ${raw}`));
          }
        });
      });

      req.on("error", reject);
    });
  }

  async sendToMany(tokens: string[], payload: PushPayload): Promise<void> {
    await Promise.allSettled(
      tokens.map((token) =>
        this.sendToDevice(token, payload).catch((err: unknown) => {
          log.error({ err, tokenPrefix: token.slice(0, 8) }, "APNs push failed for token");
        })
      )
    );
  }
}
