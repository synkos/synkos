import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';
import messages from 'src/i18n';

export type MessageLanguages = keyof typeof messages;
export type MessageSchema = (typeof messages)['en-US'];

/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

/** Read the persisted language before any store is initialized. */
function getSavedLocale(): MessageLanguages {
  try {
    const raw = localStorage.getItem('tgc-settings');
    if (raw) {
      const parsed = JSON.parse(raw) as { appLang?: string };
      if (parsed.appLang === 'en-US' || parsed.appLang === 'es-ES') {
        return parsed.appLang;
      }
    }
  } catch {
    // ignore parse errors
  }
  return navigator.language.startsWith('en') ? 'en-US' : 'es-ES';
}

/**
 * Exposed so the settings store can switch the active locale reactively
 * without a page reload. Only the locale ref is exposed — avoids the
 * complex generic typing of the full i18n instance.
 */
export let setLocale: (lang: MessageLanguages) => void = () => undefined;

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: getSavedLocale(),
    fallbackLocale: 'en-US',
    legacy: false,
    messages,
  });

  // Wire up the exported setter once the instance is created
  setLocale = (lang) => {
    (i18n.global.locale as unknown as { value: string }).value = lang;
  };

  app.use(i18n);
});
