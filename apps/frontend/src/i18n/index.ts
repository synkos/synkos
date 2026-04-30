// `import type {}` forces TypeScript to resolve vue-i18n before the
// `declare module` block runs — without it, vue-tsc under pnpm's strict
// hoisting can fail with "Invalid module name in augmentation" because it
// hasn't loaded the module's symbol table yet.
import type {} from 'vue-i18n';
import type { SynkosMessages } from '@synkos/client';
import type enUS from './en-US';

// ── Type augmentation for vue-i18n autocompletion ────────────────────────────
// Full schema = core strings (auto-merged from @synkos/client) + app strings.
declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends SynkosMessages<typeof enUS> {}
}

export type MessageLanguages = 'en-US' | 'es-ES';
