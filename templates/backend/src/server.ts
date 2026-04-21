import { createApp } from '@synkos/server';
import { applyExtensions } from '@/bootstrap/extensions';
import { registerListeners } from '@/bootstrap/listeners';
import { wireAdapters } from '@/bootstrap/adapters';
import { env } from '@/config/env';
import { modules } from '@/bootstrap/modules';
import { startupHooks } from '@/bootstrap/startup';

createApp({
  modules,
  extensions: applyExtensions,
  listeners: registerListeners,
  adapters: wireAdapters,
  startupHooks,
  serviceName: env.APP_NAME,
});
