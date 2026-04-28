import type { App } from 'vue';
import type { Router } from 'vue-router';
import { Preferences } from '@capacitor/preferences';
import type { AppConfig } from 'synkos';
import { setClientConfig } from '../internal/app-config.js';
import { createApiClient } from '../api/index.js';
import { useAuthStore } from './store.js';
import type { PublicUser } from '../types.js';

export interface AuthBootOptions {
  config: AppConfig;
  /** Override the API base URL (default: import.meta.env.VITE_API_URL or http://localhost:3001/api/v1) */
  apiBaseUrl?: string;
  /** Called after a successful login of any kind. */
  onLogin?: (user: PublicUser) => void;
  /** Called after logout. */
  onLogout?: () => void;
}

export type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>;

export function createAuthBoot(options: AuthBootOptions): ClientBootFn {
  return async ({ router }) => {
    // 1. Register global config
    setClientConfig(options.config);

    // 2. Initialize API client with the resolved base URL
    const baseURL = options.apiBaseUrl ?? 'http://localhost:3001/api/v1';

    createApiClient(baseURL);

    // 3. Track background state for biometric grace period
    const bgKey =
      options.config.storageKeys.settings.replace(/-settings$/, '') + '-backgrounded-at';

    const { App: CapApp } = await import('@capacitor/app');
    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        void Preferences.set({ key: bgKey, value: String(Date.now()) });
      }
    });

    // 4. Initialize auth store
    const authStore = useAuthStore();
    let result: Awaited<ReturnType<typeof authStore.initialize>> = 'no-session';

    try {
      result = await authStore.initialize();
    } catch (err: unknown) {
      console.warn('[auth boot] initialize failed:', err);
      authStore.$patch({ isInitialized: true });
    }

    if (result === 'biometric-cancelled' || result === 'refresh-failed') {
      await router.replace({ name: 'auth-login' });
    }
  };
}
