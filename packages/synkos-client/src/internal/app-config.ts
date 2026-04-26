import type { AppConfig } from 'synkos';

// Use globalThis instead of a module-level variable so the singleton survives
// across multiple module instances (Vite dev mode with workspace symlinks can
// load the same chunk more than once under different module IDs).
const KEY = '__synkos_client_config__' as const;
type G = typeof globalThis & { [KEY]?: AppConfig };

export function setClientConfig(config: AppConfig): void {
  (globalThis as G)[KEY] = config;
}

export function getClientConfig(): AppConfig {
  const config = (globalThis as G)[KEY];
  if (!config) {
    throw new Error(
      '[synkos/client] Not initialized. Did you call createAuthBoot() in your boot files?'
    );
  }
  return config;
}
