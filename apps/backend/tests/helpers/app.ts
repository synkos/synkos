import request, { type Test } from 'supertest';
import type { Application } from 'express';
import { buildApp } from '@synkos/server';
import { setEmailAdapter } from '@synkos/server/adapters';
import { authModule } from '@synkos/server/modules/auth';
import { userModule } from '@synkos/server/modules/user';
import { accountModule } from '@synkos/server/modules/account';
import { usernameModule } from '@synkos/server/modules/username';
import { applyExtensions } from '@/bootstrap/extensions';
import { registerListeners } from '@/bootstrap/listeners';
import { wireAdapters } from '@/bootstrap/adapters';
import { capturingEmail } from './email';

const testModules = [authModule, userModule, accountModule, usernameModule];

let _app: Application | null = null;

export function getApp(): Application {
  if (_app) return _app;
  _app = buildApp({
    modules: testModules,
    extensions: applyExtensions,
    listeners: registerListeners,
    adapters: () => {
      wireAdapters();
      // Override the email adapter AFTER wireAdapters() so we capture all sends
      setEmailAdapter(capturingEmail);
    },
  });
  return _app;
}

let _ipSeq = 1;
const nextIp = (): string => {
  const n = _ipSeq++;
  return `10.${Math.floor(n / 65025) % 255}.${Math.floor(n / 255) % 255}.${n % 255}`;
};

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

export function api(method: Method, path: string): Test {
  return (request(getApp()) as unknown as Record<Method, (url: string) => Test>)
    [method](path)
    .set('X-Forwarded-For', nextIp());
}

export function authedApi(method: Method, path: string, accessToken: string): Test {
  return api(method, path).set('Authorization', `Bearer ${accessToken}`);
}

export interface TestUser {
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
}

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
