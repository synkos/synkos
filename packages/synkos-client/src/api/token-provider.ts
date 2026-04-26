const KEY = '__synkos_token_provider__' as const;
type G = typeof globalThis & { [KEY]?: () => string | null };

export function registerTokenProvider(fn: () => string | null): void {
  (globalThis as G)[KEY] = fn;
}

export function getAccessToken(): string | null {
  return (globalThis as G)[KEY]?.() ?? null;
}
