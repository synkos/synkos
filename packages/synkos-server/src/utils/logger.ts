import pino from "pino";
import { env } from "@/config/env";
import { getRequestContext } from "@/context/request-context";

const isDev = env.NODE_ENV !== "production";

/**
 * Root application logger.
 *
 * - Development: pretty-printed, colorized, human-readable output.
 * - Production: structured JSON to stdout — ready for log aggregators
 *   (Datadog, Loki, CloudWatch, etc.).
 *
 * Sensitive fields are redacted at the serializer level so they never
 * reach the log sink, regardless of log level.
 */
export const logger = pino(
  {
    level: isDev ? "debug" : "info",

    // Automatically inject requestId + userId from AsyncLocalStorage into every log line.
    // Works for all child loggers (createLogger) with zero changes in services.
    mixin() {
      const ctx = getRequestContext();
      if (!ctx) return {};
      return {
        requestId: ctx.requestId,
        ...(ctx.userId ? { userId: ctx.userId } : {}),
      };
    },

    // Redact sensitive fields before any log line is emitted
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.body.password",
        "req.body.newPassword",
        "req.body.token",
        "req.body.refreshToken",
        "req.body.idToken",
        "password",
        "passwordHash",
        "token",
        "refreshToken",
      ],
      censor: "[REDACTED]",
    },
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
          messageFormat: "{if module}[{module}] {end}{msg}",
          errorLikeObjectKeys: ["err", "error"],
        },
      })
    : undefined
);

/**
 * Creates a named child logger for a specific module.
 * The `module` field appears in every log line, making it easy to
 * filter logs by subsystem in development and production.
 *
 * @example
 * const log = createLogger("auth");
 * log.info("User registered");  // → [auth] User registered
 */
export function createLogger(name: string): pino.Logger {
  return logger.child({ module: name });
}
