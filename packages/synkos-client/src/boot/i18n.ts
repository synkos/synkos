import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { AppConfig } from 'synkos';
import { registerSetLocale } from '../internal/i18n-bridge.js';
import { setClientConfig, getClientConfig } from '../internal/app-config.js';
import coreEnUS from '../i18n/en-US.js';
import coreEsES from '../i18n/es-ES.js';

type AnyMessages = Record<string, unknown>;

export interface I18nBootOptions {
  /**
   * App configuration. Required when i18n runs before auth in the boot order
   * (the default Quasar order is i18n → auth). Calling setClientConfig early
   * here ensures every subsequent boot and store can call getClientConfig().
   */
  config?: AppConfig;
  /**
   * App i18n messages. These should already include the core strings via spread
   * (see the template's src/i18n/en-US/index.ts for the pattern). If omitted,
   * only the bare core strings are used.
   */
  messages?: {
    'en-US'?: AnyMessages;
    'es-ES'?: AnyMessages;
    [locale: string]: AnyMessages | undefined;
  };
}

export type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>;

export function createI18nBoot(options: I18nBootOptions = {}): ClientBootFn {
  return async ({ app }) => {
    // Initialize config as early as possible so any boot that runs after this
    // (auth, notifications) can safely call getClientConfig().
    if (options.config) {
      setClientConfig(options.config);
    }

    const { createI18n } = await import('vue-i18n');

    // Read the persisted locale from the config-aware storage key
    const storageKey = getClientConfig().storageKeys.settings;
    let locale = 'en-US';
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { appLang?: string };
        if (parsed.appLang) locale = parsed.appLang;
      }
    } catch {
      // ignore
    }
    if (!locale) {
      locale = navigator.language.startsWith('en') ? 'en-US' : 'es-ES';
    }

    // Use the app's messages directly. The app's i18n files spread from coreEnUS/coreEsES
    // at build time (see src/i18n/en-US/index.ts), so they already contain all core strings.
    // Fall back to the bare core if no app messages are provided.
    const messages: Record<string, AnyMessages> = {
      'en-US': (options.messages?.['en-US'] ?? coreEnUS) as AnyMessages,
      'es-ES': (options.messages?.['es-ES'] ?? coreEsES) as AnyMessages,
    };

    // Add any extra locales the app provides
    for (const [lang, msgs] of Object.entries(options.messages ?? {})) {
      if (lang !== 'en-US' && lang !== 'es-ES' && msgs) {
        messages[lang] = msgs;
      }
    }

    const i18n = createI18n({
      locale,
      fallbackLocale: 'en-US',
      legacy: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
    });

    registerSetLocale((lang) => {
      (i18n.global.locale as unknown as { value: string }).value = lang;
    });

    app.use(i18n);
  };
}
