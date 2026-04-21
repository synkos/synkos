import type { Request, Response, NextFunction } from 'express';
import { runWithRequestContext } from '@/context/request-context';
import { getMetricsAdapter } from '@/adapters/metrics/metrics.registry';

const EXCLUDED_PATHS = new Set(['/health/live', '/health/ready', '/metrics']);

/**
 * Sets up the AsyncLocalStorage request context for every incoming request.
 * Must run after pino-http (which sets req.id) and before all other middleware.
 *
 * Responsibilities:
 *   1. Creates a RequestContext with the request ID from pino-http
 *   2. Runs the rest of the middleware chain inside that context so all
 *      logs emitted during this request automatically include requestId + userId
 *   3. Records HTTP metrics on response finish (method, matched route, status, duration)
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req as Request & { id: string }).id;
  const startTime = Date.now();

  // Record metrics on response finish — req.route is populated by Express by then
  if (!EXCLUDED_PATHS.has(req.path)) {
    res.on('finish', () => {
      const routePattern = req.route ? `${req.baseUrl}${req.route.path as string}` : req.path;

      getMetricsAdapter().recordHttpRequest({
        method: req.method,
        route: routePattern,
        statusCode: res.statusCode,
        durationMs: Date.now() - startTime,
      });
    });
  }

  runWithRequestContext({ requestId }, () => next());
}
