/**
 * Contract that every queue adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider (BullMQ, etc.).
 * Projects provide their implementation via setQueueAdapter() in bootstrap/adapters.ts.
 *
 * Two adapters are provided out of the box:
 *   - NoopQueueAdapter  — runs jobs in-process (development, no Redis needed)
 *   - BullMQAdapter     — durable Redis-backed queue (production)
 */

export interface JobOptions {
  /** Max retry attempts on failure. Default: 3 */
  attempts?: number;
  /** Milliseconds to wait before the first attempt */
  delay?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    /** Base delay in ms between retries */
    delay: number;
  };
}

export interface RepeatOptions {
  /** Interval in milliseconds between runs */
  every?: number;
  /** Cron expression (alternative to every) */
  cron?: string;
  /** Run once immediately when scheduled, then on interval */
  immediately?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JobHandler<T = any> = (data: T) => Promise<void>;

export interface QueuePort {
  /**
   * Register a handler for a named job type.
   * Must be called before start().
   */
  register<T = unknown>(name: string, handler: JobHandler<T>): void;

  /**
   * Enqueue a one-off job.
   */
  add<T = unknown>(name: string, data: T, options?: JobOptions): Promise<void>;

  /**
   * Schedule a repeating job. Idempotent — safe to call on every startup.
   * The job runs on the registered handler.
   */
  schedule<T = unknown>(
    name: string,
    data: T,
    repeat: RepeatOptions,
    options?: JobOptions
  ): Promise<void>;

  /**
   * Start consuming jobs from the queue.
   * Must be called after all handlers are registered.
   */
  start(): Promise<void>;

  /**
   * Gracefully drain in-flight jobs and close all connections.
   */
  close(): Promise<void>;
}
