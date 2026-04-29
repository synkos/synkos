const KEY = '__synkos_token_provider__' as const;
const READY_KEY = '__synkos_auth_ready__' as const;

type G = typeof globalThis & {
  [KEY]?: () => string | null;
  [READY_KEY]?: () => Promise<unknown>;
};

export function registerTokenProvider(fn: () => string | null): void {
  (globalThis as G)[KEY] = fn;
}

export function getAccessToken(): string | null {
  return (globalThis as G)[KEY]?.() ?? null;
}

/**
 * Register a hook the API client awaits before each request, so the
 * Authorization header reflects the rehydrated session even when a request
 * fires from `onMounted` of a callback page that loaded before hydration
 * finished. The auth store registers itself; consumers don't call this.
 */
export function registerAuthReady(fn: () => Promise<unknown>): void {
  (globalThis as G)[READY_KEY] = fn;
}

/**
 * Awaits the registered auth-ready hook with a hard timeout. If hydration
 * has not completed within the timeout the function resolves anyway, so a
 * stuck rehydration never blocks the API client indefinitely — the request
 * goes out without `Authorization` and the response interceptor handles 401.
 */
export async function awaitAuthReady(timeoutMs = 5000): Promise<void> {
  const ready = (globalThis as G)[READY_KEY];
  if (!ready) return;
  await Promise.race([
    ready().catch(() => undefined),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
