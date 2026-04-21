import { Queue, Worker, type ConnectionOptions } from 'bullmq';
import { createLogger } from '@/utils/logger';
import type { JobHandler, JobOptions, QueuePort, RepeatOptions } from '@/ports/queue.port';

const log = createLogger('queue:bullmq');

export interface BullMQAdapterConfig {
  /** Redis connection URL (e.g. redis://localhost:6379) */
  redisUrl: string;
  /** Queue name. Default: 'core' */
  queueName?: string;
  /**
   * Max concurrency for the worker — how many jobs run in parallel.
   * Default: 5
   */
  concurrency?: number;
}

/**
 * BullMQ queue adapter — production-grade Redis-backed job queue.
 *
 * Jobs are durable: they survive process restarts.
 * Workers can run in a separate process from the HTTP server (see src/worker.ts).
 *
 * Queue (producer) and Worker (consumer) use separate Redis connections
 * as required by BullMQ — the Worker uses blocking commands.
 */
export class BullMQAdapter implements QueuePort {
  private readonly queue: Queue;
  private worker: Worker | null = null;
  private readonly handlers = new Map<string, JobHandler>();
  private readonly connection: ConnectionOptions;
  private readonly queueName: string;
  private readonly concurrency: number;

  constructor({ redisUrl, queueName = 'core', concurrency = 5 }: BullMQAdapterConfig) {
    this.queueName = queueName;
    this.concurrency = concurrency;

    // BullMQ requires maxRetriesPerRequest: null for blocking commands used by the Worker.
    // Both Queue and Worker share this setting for consistency.
    this.connection = { url: redisUrl, maxRetriesPerRequest: null } as ConnectionOptions;
    this.queue = new Queue(this.queueName, { connection: this.connection });
  }

  register<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler);
  }

  async add<T>(name: string, data: T, options?: JobOptions): Promise<void> {
    await this.queue.add(name, data, {
      attempts: options?.attempts ?? 3,
      delay: options?.delay,
      backoff: options?.backoff
        ? { type: options.backoff.type, delay: options.backoff.delay }
        : { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 }, // keep last 100 completed for debugging
      removeOnFail: { count: 500 },
    });
  }

  async schedule<T>(
    name: string,
    data: T,
    repeat: RepeatOptions,
    options?: JobOptions
  ): Promise<void> {
    if (!repeat.every && !repeat.cron) {
      throw new Error(`schedule() requires either 'every' or 'cron' — job: ${name}`);
    }

    // BullMQ deduplicates repeatable jobs by name + repeat pattern, so this is idempotent.
    await this.queue.add(name, data, {
      repeat: repeat.cron ? { pattern: repeat.cron } : { every: repeat.every },
      attempts: options?.attempts ?? 3,
      backoff: options?.backoff
        ? { type: options.backoff.type, delay: options.backoff.delay }
        : { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    });

    log.info({ name, repeat }, 'Repeatable job scheduled');

    // Run immediately on startup if requested (one-off job, separate from the repeating schedule)
    if (repeat.immediately) {
      await this.add(name, data, options);
    }
  }

  async start(): Promise<void> {
    this.worker = new Worker(
      this.queueName,
      async (job) => {
        const handler = this.handlers.get(job.name);
        if (!handler) {
          throw new Error(`No handler registered for job: ${job.name}`);
        }
        log.info({ jobId: job.id, name: job.name }, 'Processing job');
        await handler(job.data);
        log.info({ jobId: job.id, name: job.name }, 'Job completed');
      },
      {
        connection: this.connection,
        concurrency: this.concurrency,
      }
    );

    this.worker.on('failed', (job, err) => {
      log.error({ err, jobId: job?.id, name: job?.name }, 'Job failed');
    });

    this.worker.on('error', (err) => {
      log.error({ err }, 'BullMQ worker error');
    });

    log.info({ queue: this.queueName, concurrency: this.concurrency }, 'BullMQ worker started');
  }

  async close(): Promise<void> {
    await this.worker?.close();
    await this.queue.close();
    log.info('BullMQ worker and queue closed');
  }
}
