import type { coreEnUS } from '@synkos/client';
import appEnUS from './en-US';
import appEsES from './es-ES';

// ── Type augmentation for vue-i18n autocompletion ─────────────────────────────
// The full message schema = core strings (auth, settings, profile, nav…) + app strings.
type MergedMessages = typeof coreEnUS & typeof appEnUS;

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MergedMessages {}
}

export type MessageLanguages = 'en-US' | 'es-ES';
export type MessageSchema = MergedMessages;

// Kept for any code that imports from 'src/i18n' directly.
export default {
  'en-US': appEnUS,
  'es-ES': appEsES,
};
