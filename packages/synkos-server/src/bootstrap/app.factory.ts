import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import type { ModuleDefinition } from '@/types/module.types';
import { requestContextMiddleware } from '@/middleware/request-context.middleware';
import { getMetricsAdapter } from '@/adapters/metrics/metrics.registry';
import { connectDatabase } from '@/config/database';
import { wireAdapters as wireCoreAdapters } from '@/bootstrap/wire-adapters';
import { authModule } from '@/modules/auth';
import { userModule } from '@/modules/user';
import { accountModule } from '@/modules/account';
import { usernameModule } from '@/modules/username';
import { notificationsModule } from '@/modules/notifications';

const CORE_MODULES: ModuleDefinition[] = [
  authModule,
  userModule,
  accountModule,
  usernameModule,
  notificationsModule,
];

export interface AppConfig {
  modules: ModuleDefinition[];
  /** Called first — Mongoose schema patches and core hooks */
  extensions?: () => void;
  /** Called second — domain event subscriptions */
  listeners?: () => void;
  /** Called third — project-level adapter overrides */
  adapters?: () => void;
  /** Async hooks run after DB connects, before the server starts */
  startupHooks?: Array<() => Promise<void>>;
  /** API version prefix. Default: '/api/v1' */
  apiPrefix?: string;
  /** Name shown in healthcheck response. Default: 'API' */
  serviceName?: string;
  /** Core module paths to exclude, e.g. ["/auth", "/notifications"] */
  disableCoreModules?: string[];
}

/**
 * Boots the full server: runs the extension/listener/adapter hooks, connects
 * to the database, mounts all modules, and starts listening on env.PORT.
 * Returns the underlying http.Server so callers can shut it down cleanly.
 */
export async function createApp({
  modules,
  extensions,
  listeners,
  adapters,
  startupHooks = [],
  apiPrefix = '/api/v1',
  serviceName = 'API',
  disableCoreModules = [],
}: AppConfig): Promise<void> {
  try {
    extensions?.();
    listeners?.();
    wireCoreAdapters();
    adapters?.();

    await connectDatabase();

    for (const hook of startupHooks) {
      await hook();
    }

    const app = _buildApp({ modules, apiPrefix, serviceName, disableCoreModules });

    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT }, `${serviceName} started`);
    });

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down server — draining in-flight requests');
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Startup error — shutting down');
    process.exit(1);
  }
}

function _buildApp({
  modules,
  apiPrefix,
  serviceName,
  disableCoreModules,
}: Required<
  Pick<AppConfig, 'modules' | 'apiPrefix' | 'serviceName' | 'disableCoreModules'>
>): express.Application {
  const app = express();

  // Trust the first hop (reverse proxy / Cloudflare) so req.ip contains the real client IP
  app.set('trust proxy', 1);

  // HTTP request/response logger — health checks are excluded to avoid log noise
  app.use(
    pinoHttp({
      logger,
      genReqId: () => randomUUID(),
      autoLogging: { ignore: (req) => req.url === '/health/live' || req.url === '/health/ready' },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
      customErrorMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
      serializers: {
        req: (req) => ({
          id: req.id,
          method: req.method,
          url: req.url,
          remoteAddress: req.remoteAddress,
          userAgent: (req.headers as Record<string, string>)['user-agent'],
        }),
        res: (res) => ({
          statusCode: res.statusCode,
        }),
      },
    })
  );

  // Request context — must run after pino-http (which sets req.id) and before
  // all other middleware so every downstream log line gets requestId + userId.
  // Also hooks res.finish to record HTTP metrics.
  app.use(requestContextMiddleware);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json());

  // Metrics — before rate limiter so scraping is never throttled.
  // Returns 404 if no metrics adapter is configured (noop default).
  app.get('/metrics', async (_req, res) => {
    const metrics = await getMetricsAdapter().getMetrics();
    if (metrics === null) {
      res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Metrics not configured' } });
      return;
    }
    res.set('Content-Type', getMetricsAdapter().contentType).send(metrics);
  });

  // Liveness — is the process alive? Never fails (if this responds, the process is up)
  // Railway/k8s: restart only when this stops responding
  app.get('/health/live', (_req, res) => {
    res.status(200).json({ success: true, data: { status: 'ok' } });
  });

  // Readiness — is the process ready to serve traffic?
  // Railway/k8s: stop sending traffic when this returns 503 (e.g. DB not connected yet)
  app.get('/health/ready', (_req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbOk = dbState === 1; // 1 = connected

    const allOk = dbOk;
    const httpCode = allOk ? 200 : 503;

    res.status(httpCode).json({
      success: allOk,
      data: {
        status: allOk ? 'ok' : 'degraded',
        service: serviceName,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          database: dbOk ? 'ok' : 'error',
        },
      },
    });
  });

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      skip: () => env.NODE_ENV !== 'production' && env.RATE_LIMIT_SKIP_DEV,
    })
  );

  // Mount all modules under the API prefix
  const router = express.Router();

  const coreModules = disableCoreModules.length
    ? CORE_MODULES.filter((m) => !disableCoreModules.includes(m.path))
    : CORE_MODULES;

  for (const mod of [...coreModules, ...modules]) {
    router.use(mod.path, mod.router);
  }

  app.use(apiPrefix, router);

  // Global error handler — must have 4 parameters for Express to treat it as error middleware
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status ?? 500;

    if (status >= 500) {
      req.log.error({ err }, err.message);
    } else {
      req.log.warn({ err }, err.message);
    }

    const customCode = (err as { code?: string }).code;
    const code =
      customCode ??
      (status === 500 ? 'INTERNAL_ERROR' : status === 429 ? 'TOO_MANY_REQUESTS' : 'REQUEST_ERROR');

    res.status(status).json({
      success: false,
      error: {
        code,
        message:
          env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : err.message,
      },
    });
  });

  return app;
}
