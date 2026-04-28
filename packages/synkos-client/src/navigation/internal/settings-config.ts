import type { BuiltInSettingsSection, SettingsCustomSection } from '../router.js';

export interface ResolvedSettingsConfig {
  sections: BuiltInSettingsSection[];
  customSections: SettingsCustomSection[];
}

const KEY = '__synkos_settings_config__' as const;
type G = typeof globalThis & { [KEY]?: ResolvedSettingsConfig };

export const ALL_SECTIONS: BuiltInSettingsSection[] = [
  'account',
  'preferences',
  'notifications',
  'security',
  'billing',
  'support',
  'legal',
  'about',
];

export function setSettingsConfig(config: ResolvedSettingsConfig): void {
  (globalThis as G)[KEY] = config;
}

export function getSettingsConfig(): ResolvedSettingsConfig {
  return (globalThis as G)[KEY] ?? { sections: ALL_SECTIONS, customSections: [] };
}
