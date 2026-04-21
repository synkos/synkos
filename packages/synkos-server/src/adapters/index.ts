// Email
export { setEmailAdapter, getEmailAdapter } from './email/email.registry';
export { ResendEmailAdapter } from './email/resend.email-adapter';
export { ConsoleEmailAdapter } from './email/console.email-adapter';

// Storage
export { setStorageAdapter, getStorageAdapter } from './storage/storage.registry';
export { R2StorageAdapter } from './storage/r2.storage-adapter';
export { NoopStorageAdapter } from './storage/noop.storage-adapter';

// Notification
export {
  setNotificationAdapter,
  getNotificationAdapter,
} from './notification/notification.registry';
export { ApnsNotificationAdapter } from './notification/apns.notification-adapter';
export { NoopNotificationAdapter } from './notification/noop.notification-adapter';

// Queue
export { setQueueAdapter, getQueueAdapter } from './queue/queue.registry';
export { BullMQAdapter } from './queue/bullmq.queue-adapter';
export { NoopQueueAdapter } from './queue/noop.queue-adapter';

// Cache
export { setCacheAdapter, getCache, CacheKeys } from './cache/cache.registry';
export { RedisCacheAdapter } from './cache/redis.cache-adapter';
export { NoopCacheAdapter } from './cache/noop.cache-adapter';

// Metrics
export { setMetricsAdapter, getMetricsAdapter } from './metrics/metrics.registry';
export { PrometheusMetricsAdapter } from './metrics/prometheus.metrics-adapter';
export { NoopMetricsAdapter } from './metrics/noop.metrics-adapter';
