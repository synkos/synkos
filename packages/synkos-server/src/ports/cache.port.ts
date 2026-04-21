/**
 * Contract that every cache adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider (Redis, etc.).
 * Projects provide their implementation via setCacheAdapter() in bootstrap/adapters.ts.
 *
 * Two adapters are provided out of the box:
 *   - NoopCacheAdapter  — always misses (development, no Redis needed)
 *   - RedisCacheAdapter — production Redis-backed cache
 */
export interface CachePort {
  /**
   * Retrieve a cached value. Returns null on miss.
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Store a value. ttlSeconds defaults to 300 (5 min) if omitted.
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Delete one or multiple keys. No-op if a key does not exist.
   */
  del(key: string | string[]): Promise<void>;

  /**
   * Cache-aside helper: returns the cached value on hit,
   * or calls fn(), stores the result, and returns it on miss.
   */
  getOrSet<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number): Promise<T>;
}
