import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { AppConfig } from 'synkos';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { setClientConfig, getClientConfig } from '../internal/app-config.js';
import { registerSetLocale } from '../internal/i18n-bridge.js';
import { createApiClient } from '../api/index.js';
import { useAuthStore } from '../auth/store.js';
import { notificationsService } from '../services/notifications.service.js';
import coreEnUS from '../i18n/en-US.js';
import coreEsES from '../i18n/es-ES.js';
import type {
  PushNotificationHandler,
  PushActionHandler,
} from '../services/notifications.service.js';
import type { PublicUser } from '../types.js';

type AnyMessages = Record<string, unknown>;

export interface SynkosBootOptions {
  config: AppConfig;
  /** API base URL. Defaults to VITE_API_URL env var or http://localhost:3001/api/v1 */
  apiBaseUrl?: string;
  /**
   * App-specific i18n messages. Core strings are merged in automatically —
   * no need to spread coreEnUS/coreEsES. Only provide app-specific keys here.
   */
  messages?: {
    'en-US'?: AnyMessages;
    'es-ES'?: AnyMessages;
    [locale: string]: AnyMessages | undefined;
  };
  notifications?: {
    onNotification?: PushNotificationHandler;
    onActionPerformed?: PushActionHandler;
  };
  onLogin?: (user: PublicUser) => void;
  onLogout?: () => void;
}

export type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>;

function deepMerge<T extends AnyMessages>(base: T, override: AnyMessages): T {
  const result = { ...base } as AnyMessages;
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    if (
      b !== null &&
      o !== null &&
      typeof b === 'object' &&
      typeof o === 'object' &&
      !Array.isArray(b) &&
      !Array.isArray(o)
    ) {
      result[key] = deepMerge(b as AnyMessages, o as AnyMessages);
    } else {
      result[key] = o;
    }
  }
  return result as T;
}

export function createSynkosBoot(options: SynkosBootOptions): ClientBootFn {
  return async ({ app, router }) => {
    // ── 0. Platform ───────────────────────────────────────────────────────────
    document.documentElement.dataset.platform = Capacitor.getPlatform();

    // ── 1. Config ────────────────────────────────────────────────────────────
    setClientConfig(options.config);

    // ── 2. i18n ──────────────────────────────────────────────────────────────
    const { createI18n } = await import('vue-i18n');

    const storageKey = getClientConfig().storageKeys.settings;
    let locale = 'en-US';
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { appLang?: string };
        if (parsed.appLang) locale = parsed.appLang;
      }
    } catch {
      // ignore — use default locale
    }
    if (!locale) {
      locale = navigator.language.startsWith('en') ? 'en-US' : 'es-ES';
    }

    // Auto-merge: core strings are the base, app messages override/extend
    const appEN = (options.messages?.['en-US'] ?? {}) as AnyMessages;
    const appES = (options.messages?.['es-ES'] ?? {}) as AnyMessages;

    const messages: Record<string, AnyMessages> = {
      'en-US': deepMerge(coreEnUS as AnyMessages, appEN),
      'es-ES': deepMerge(coreEsES as AnyMessages, appES),
    };

    for (const [lang, msgs] of Object.entries(options.messages ?? {})) {
      if (lang !== 'en-US' && lang !== 'es-ES' && msgs) {
        messages[lang] = msgs;
      }
    }

    const i18n = createI18n({
      locale,
      fallbackLocale: 'en-US',
      legacy: false,
      messages: messages as never,
    });

    registerSetLocale((lang) => {
      (i18n.global.locale as unknown as { value: string }).value = lang;
    });

    app.use(i18n);

    // ── 3. API client ─────────────────────────────────────────────────────────
    const baseURL =
      options.apiBaseUrl ??
      (typeof import.meta !== 'undefined'
        ? (import.meta.env?.VITE_API_URL as string)
        : undefined) ??
      'http://localhost:3001/api/v1';

    createApiClient(baseURL);

    // ── 4. Background tracking for biometric grace period ─────────────────────
    const bgKey =
      options.config.storageKeys.settings.replace(/-settings$/, '') + '-backgrounded-at';
    const { App: CapApp } = await import('@capacitor/app');
    void CapApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        void Preferences.set({ key: bgKey, value: String(Date.now()) });
      }
    });

    // ── 5. Auth store initialization ──────────────────────────────────────────
    const authStore = useAuthStore();
    let result: Awaited<ReturnType<typeof authStore.initialize>> = 'no-session';
    try {
      result = await authStore.initialize();
    } catch (err: unknown) {
      console.warn('[synkos boot] auth initialize failed:', err);
      authStore.$patch({ isInitialized: true });
    }

    if (result === 'biometric-cancelled' || result === 'refresh-failed') {
      await router.replace({ name: 'auth-login' });
    }

    // ── 6. Push notifications ─────────────────────────────────────────────────
    if (options.config.features.pushNotifications !== false) {
      await notificationsService.init({
        onNotification:
          options.notifications?.onNotification ??
          ((n) => {
            console.warn('[notifications] Foreground:', n.title, n.body);
          }),
        onActionPerformed:
          options.notifications?.onActionPerformed ??
          ((action) => {
            const data = (action.notification.data ?? {}) as {
              screen?: string;
              params?: Record<string, string>;
              query?: Record<string, string>;
            };
            if (!data.screen) return;
            void router.push({
              name: data.screen,
              ...(data.params && { params: data.params }),
              ...(data.query && { query: data.query }),
            });
          }),
      });
    }

    // ── 7. Splash screen ──────────────────────────────────────────────────────
    if (Capacitor.isNativePlatform()) {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide({ fadeOutDuration: 0 });
      } catch {
        // no-op on web
      }
    }
  };
}
