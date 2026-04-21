import { NoopCacheAdapter } from "./noop.cache-adapter";
import type { CachePort } from "@/ports/cache.port";

/**
 * Module-level singleton. Starts with the noop adapter so the app is safe
 * to boot with no Redis configuration — cache misses fall through to the DB.
 *
 * Projects call setCacheAdapter() in bootstrap/adapters.ts (imported before
 * any module that could trigger a cached read).
 */
let adapter: CachePort = new NoopCacheAdapter();

export function setCacheAdapter(impl: CachePort): void {
  adapter = impl;
}

export function getCache(): CachePort {
  return adapter;
}

/**
 * Canonical cache key builders for core entities.
 * Using a central registry prevents key collisions across modules.
 *
 * Convention: `{zone}:{entity}:{id}`
 * Projects add their own keys following the same pattern.
 */
export const CacheKeys = {
  user: (userId: string) => `core:user:${userId}`,
} as const;
