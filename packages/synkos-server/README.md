# @synkos/server

Backend framework for Synkos — Express 5 + Mongoose 9 + Zod 4 with a batteries-included auth and user module.

> **Note:** This package is best consumed via the scaffold CLI (`pnpm create synkos`) which generates a project pre-wired to `@synkos/server`. Manual integration is possible but assumes familiarity with the architecture.

## Install

```bash
pnpm add @synkos/server
```

## Entry points

```ts
// Main bootstrap
import { createApp, createWorker, wireAdapters } from '@synkos/server';

// Auth, user, account modules
import { authRouter, userRouter, accountRouter } from '@synkos/server/modules/auth';
import { usernameRouter } from '@synkos/server/modules/username';
import { notificationsRouter } from '@synkos/server/modules/notifications';

// Middleware
import { authenticate, requireAdmin, requestContext } from '@synkos/server/middleware';

// Adapters (interfaces for email, storage, cache, queue, etc.)
import type { EmailAdapter, StorageAdapter, CacheAdapter, QueueAdapter } from '@synkos/server/ports';

// Built-in adapter implementations
import { ResendEmailAdapter, ConsoleEmailAdapter } from '@synkos/server/adapters';
import { R2StorageAdapter, NoopStorageAdapter } from '@synkos/server/adapters';
import { RedisAdapter, MemoryAdapter } from '@synkos/server/adapters';

// Utilities
import { AppError, createRouter } from '@synkos/server/utils';

// Core events
import { coreEvents } from '@synkos/server/events';
```

## Architecture

`@synkos/server` is organized around **6 extension points** defined in `bootstrap/`:

| File | Purpose |
|---|---|
| `bootstrap/adapters.ts` | Wire adapter implementations (email, storage, cache, etc.) |
| `bootstrap/routes.ts` | Register Express routers |
| `bootstrap/middleware.ts` | Global middleware (CORS, body parser, rate limit) |
| `bootstrap/events.ts` | Subscribe to core domain events |
| `bootstrap/jobs.ts` | Register BullMQ workers and scheduled jobs |
| `bootstrap/config.ts` | Validate and export typed env config |

## Adapters

The framework uses the port/adapter pattern. You swap implementations without touching business logic:

| Port | Built-in adapters |
|---|---|
| Email | `ResendEmailAdapter`, `ConsoleEmailAdapter` |
| Storage | `R2StorageAdapter`, `NoopStorageAdapter` |
| Cache | `RedisAdapter`, `MemoryAdapter` |
| Queue | `BullMQAdapter`, `NoopQueueAdapter` |
| Push notifications | `APNsAdapter`, `NoopNotificationsAdapter` |
| Metrics | `PrometheusAdapter`, `NoopMetricsAdapter` |

## Auth module

Provides ready-to-use routes for:
- Email/password registration and login
- JWT access + refresh token flow
- Apple Sign In, Google OAuth
- Email verification
- Password reset
- Biometric (device-side, no server changes needed)
- Account deletion (30-day grace period)

## Environment variables

The scaffold generates a `.env.example` with all required variables documented. See `bootstrap/config.ts` in the generated project.
