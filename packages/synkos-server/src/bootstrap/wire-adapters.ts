import { env } from "@/config/env";
import { setEmailAdapter } from "@/adapters/email/email.registry";
import { ResendEmailAdapter } from "@/adapters/email/resend.email-adapter";
import { setStorageAdapter } from "@/adapters/storage/storage.registry";
import { R2StorageAdapter } from "@/adapters/storage/r2.storage-adapter";
import { setNotificationAdapter } from "@/adapters/notification/notification.registry";
import { ApnsNotificationAdapter } from "@/adapters/notification/apns.notification-adapter";
import { setQueueAdapter } from "@/adapters/queue/queue.registry";
import { BullMQAdapter } from "@/adapters/queue/bullmq.queue-adapter";
import { setCacheAdapter } from "@/adapters/cache/cache.registry";
import { RedisCacheAdapter } from "@/adapters/cache/redis.cache-adapter";
import { setMetricsAdapter } from "@/adapters/metrics/metrics.registry";
import { PrometheusMetricsAdapter } from "@/adapters/metrics/prometheus.metrics-adapter";

export function wireAdapters(): void {
  if (env.RESEND_API_KEY && env.RESEND_FROM) {
    setEmailAdapter(
      new ResendEmailAdapter({
        apiKey:        env.RESEND_API_KEY,
        from:          env.RESEND_FROM,
        fromDev:       env.RESEND_FROM_DEV ?? env.RESEND_FROM,
        devOverrideTo: env.RESEND_TEST_TO,
        isDev:         env.NODE_ENV === "development",
      }),
    );
  }

  if (
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET &&
    env.R2_PUBLIC_BASE_URL
  ) {
    setStorageAdapter(
      new R2StorageAdapter({
        accountId:       env.R2_ACCOUNT_ID,
        accessKeyId:     env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket:          env.R2_BUCKET,
        publicBaseUrl:   env.R2_PUBLIC_BASE_URL,
      }),
    );
  }

  if (env.APNS_KEY_P8 && env.APNS_KEY_ID && env.APNS_TEAM_ID && env.APNS_BUNDLE_ID) {
    setNotificationAdapter(
      new ApnsNotificationAdapter({
        keyP8:      env.APNS_KEY_P8,
        keyId:      env.APNS_KEY_ID,
        teamId:     env.APNS_TEAM_ID,
        bundleId:   env.APNS_BUNDLE_ID,
        production: env.NODE_ENV === "production",
      }),
    );
  }

  if (env.REDIS_URL) {
    setQueueAdapter(new BullMQAdapter({ redisUrl: env.REDIS_URL }));
    setCacheAdapter(new RedisCacheAdapter(env.REDIS_URL));
  }

  setMetricsAdapter(new PrometheusMetricsAdapter());
}
