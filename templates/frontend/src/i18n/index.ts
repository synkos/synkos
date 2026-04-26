import type { SynkosMessages } from '@synkos/client';
import type enUS from './en-US';

// ── Type augmentation for vue-i18n autocompletion ────────────────────────────
// Full schema = core strings (auto-merged from @synkos/client) + app strings.
declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends SynkosMessages<typeof enUS> {}
}

export type MessageLanguages = 'en-US' | 'es-ES';
