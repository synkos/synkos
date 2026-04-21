import type { CachePort } from "@/ports/cache.port";

/**
 * Noop cache adapter — default when no cache provider is configured.
 *
 * Every get() is a miss. set() and del() are no-ops.
 * getOrSet() always calls the fallback function.
 *
 * Safe to use in development with no Redis — the app works correctly,
 * just without the performance benefit of caching.
 */
export class NoopCacheAdapter implements CachePort {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _ttlSeconds?: number): Promise<void> {
    // no-op
  }

  async del(_key: string | string[]): Promise<void> {
    // no-op
  }

  async getOrSet<T>(
    _key: string,
    fn: () => Promise<T>,
    _ttlSeconds?: number
  ): Promise<T> {
    return fn();
  }
}
