import { z } from "zod";

/**
 * Base environment schema — core infrastructure variables.
 * Every project that uses this core extends this schema
 * with its own project-specific variables via .extend().
 */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  PORT: z.string().default("3001"),

  // Human-readable name for this service — used in logs, health checks, and metrics labels.
  APP_NAME: z.string().default("API"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(30),

  // OAuth — optional in development
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_IOS_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),

  // Email — optional, falls back to console.log in development
  RESEND_API_KEY: z.string().optional(),
  RESEND_TEST_TO: z.email().optional(),
  // Sender identity used for all transactional emails (password reset, verification…).
  // Required when RESEND_API_KEY is set; ignored otherwise.
  RESEND_FROM:     z.string().optional(),
  RESEND_FROM_DEV: z.string().optional(),

  // APNs (Apple Push Notification service)
  APNS_KEY_P8: z.string().optional(),
  APNS_KEY_ID: z.string().optional(),
  APNS_TEAM_ID: z.string().optional(),
  APNS_BUNDLE_ID: z.string().optional(),

  // Storage — Cloudflare R2 (optional, falls back to noop adapter)
  R2_ACCOUNT_ID:        z.string().optional(),
  R2_ACCESS_KEY_ID:     z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET:            z.string().optional(),
  R2_PUBLIC_BASE_URL:   z.string().optional(),

  // Queue — optional, falls back to in-process noop adapter in development
  REDIS_URL: z.string().optional(),

  // Client origins for CORS
  CORS_ORIGINS: z.string().default("*"),

  // Global rate limiter (applied to all /api routes before per-route limiters)
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX:       z.coerce.number().int().positive().default(200),
  // Set to "false" or "0" to enforce rate limiting in development.
  // Automatically ignored in production regardless of this value.
  RATE_LIMIT_SKIP_DEV: z
    .string()
    .default("true")
    .transform((v) => v !== "false" && v !== "0"),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
