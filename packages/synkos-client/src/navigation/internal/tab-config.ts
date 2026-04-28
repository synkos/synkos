import type { AppTabRoute } from '../../types.js';

const KEY = '__synkos_tab_config__' as const;
type G = typeof globalThis & { [KEY]?: AppTabRoute[] };

export function setTabConfig(tabs: AppTabRoute[]): void {
  (globalThis as G)[KEY] = tabs;
}

export function getTabConfig(): AppTabRoute[] {
  return (globalThis as G)[KEY] ?? [];
}
