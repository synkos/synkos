import IORedis from "ioredis";
import { createLogger } from "@/utils/logger";
import type { CachePort } from "@/ports/cache.port";

const log = createLogger("cache:redis");

const DEFAULT_TTL_SECONDS = 300; // 5 min

/**
 * Redis cache adapter — production-grade distributed cache.
 *
 * Uses a dedicated IORedis connection (separate from BullMQ's connection)
 * to avoid interference with blocking queue commands.
 *
 * Values are JSON-serialized, so any serializable type is supported.
 */
export class RedisCacheAdapter implements CachePort {
  private readonly client: IORedis;

  constructor(redisUrl: string) {
    this.client = new IORedis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on("error", (err) => {
      log.error({ err }, "Redis cache connection error");
    });

    this.client.on("connect", () => {
      log.info("Redis cache connected");
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      log.error({ err, key }, "Cache get failed — returning null");
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch (err) {
      // Cache failures must never crash the application
      log.error({ err, key }, "Cache set failed — continuing without cache");
    }
  }

  async del(key: string | string[]): Promise<void> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length === 0) return;
      await this.client.del(...keys);
    } catch (err) {
      log.error({ err, key }, "Cache del failed — continuing without cache");
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL_SECONDS
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
