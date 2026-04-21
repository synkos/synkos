import request, { type Test } from 'supertest';
import type { Application } from 'express';
import { createApp } from '@synkos/server';
import { setEmailAdapter } from '@synkos/server/adapters';
import { authModule } from '@synkos/server/modules/auth';
import { userModule } from '@synkos/server/modules/user';
import { accountModule } from '@synkos/server/modules/account';
import { usernameModule } from '@synkos/server/modules/username';
import { applyExtensions } from '@/bootstrap/extensions';
import { registerListeners } from '@/bootstrap/listeners';
import { wireAdapters } from '@/bootstrap/adapters';
import { capturingEmail } from './email';

// Core modules only — add feature modules if your tests require them
const testModules = [authModule, userModule, accountModule, usernameModule];

let _app: Application | null = null;

/**
 * Returns the singleton test Express application.
 * Bootstrap runs once per worker process. Subsequent calls return the same app.
 */
export function getApp(): Application {
  if (_app) return _app;

  applyExtensions();
  registerListeners();
  wireAdapters();
  // Override email adapter AFTER wireAdapters() so we capture all sends
  setEmailAdapter(capturingEmail);

  _app = createApp({ modules: testModules });
  return _app;
}

// ── IP rotation ───────────────────────────────────────────────────────────────
// Each call returns a fresh IP so per-route rate limiters never block tests.
let _ipSeq = 1;
const nextIp = (): string => {
  const n = _ipSeq++;
  return `10.${Math.floor(n / 65025) % 255}.${Math.floor(n / 255) % 255}.${n % 255}`;
};

// ── Request builders ──────────────────────────────────────────────────────────

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

/** Unauthenticated request with a unique IP to bypass rate limiters. */
export function api(method: Method, path: string): Test {
  return (request(getApp()) as unknown as Record<Method, (url: string) => Test>)
    [method](path)
    .set('X-Forwarded-For', nextIp());
}

/** Authenticated request (Bearer token). */
export function authedApi(method: Method, path: string, accessToken: string): Test {
  return api(method, path).set('Authorization', `Bearer ${accessToken}`);
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export interface TestUser {
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

/**
 * Register a new user and return their credentials.
 * Generates a unique email per call so tests never collide.
 */
export async function registerUser(
  overrides: { email?: string; password?: string } = {}
): Promise<TestUser> {
  const email =
    overrides.email ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}@test.example`;
  const password = overrides.password ?? 'Password123!';

  const res = await api('post', '/api/v1/auth/register').send({ email, password });

  if (res.status !== 201) {
    throw new Error(`registerUser failed [${res.status}]: ${JSON.stringify(res.body)}`);
  }

  return {
    email,
    password,
    accessToken: res.body.data.tokens.accessToken as string,
    refreshToken: res.body.data.tokens.refreshToken as string,
    userId: res.body.data.user.id as string,
  };
}
