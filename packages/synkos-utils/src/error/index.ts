/**
 * Base application error with HTTP status and machine-readable code.
 *
 * Used throughout the Synkos ecosystem to produce consistent error shapes
 * that travel from the API layer to the frontend error handler.
 *
 * @example
 * throw new AppError(409, 'EMAIL_TAKEN', 'Email already registered');
 *
 * @example — in an Express error handler
 * if (err instanceof AppError) {
 *   res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
 * }
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;

    // Maintain proper prototype chain in transpiled environments
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
      },
    };
  }
}

/** Type guard for AppError instances */
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

// ── Common error factories ────────────────────────────────────────────────────

export const Errors = {
  badRequest: (message: string, code = 'BAD_REQUEST') =>
    new AppError(400, code, message),

  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED') =>
    new AppError(401, code, message),

  forbidden: (message = 'Forbidden', code = 'FORBIDDEN') =>
    new AppError(403, code, message),

  notFound: (resource = 'Resource', code = 'NOT_FOUND') =>
    new AppError(404, code, `${resource} not found`),

  conflict: (message: string, code = 'CONFLICT') =>
    new AppError(409, code, message),

  tooManyRequests: (message = 'Too many requests', code = 'RATE_LIMITED') =>
    new AppError(429, code, message),

  internal: (message = 'Internal server error', code = 'INTERNAL_ERROR') =>
    new AppError(500, code, message),
} as const;
