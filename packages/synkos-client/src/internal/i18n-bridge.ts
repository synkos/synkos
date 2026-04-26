const KEY = '__synkos_set_locale__' as const;
type G = typeof globalThis & { [KEY]?: (lang: string) => void };

export function registerSetLocale(fn: (lang: string) => void): void {
  (globalThis as G)[KEY] = fn;
}

export function setLocale(lang: string): void {
  (globalThis as G)[KEY]?.(lang);
}
