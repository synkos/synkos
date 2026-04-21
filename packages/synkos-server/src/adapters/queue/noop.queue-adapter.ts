import { createLogger } from '@/utils/logger';
import type { JobHandler, JobOptions, QueuePort, RepeatOptions } from '@/ports/queue.port';

const log = createLogger('queue:noop');

/**
 * Noop queue adapter — default when no queue provider is configured.
 *
 * Jobs run in-process: one-off jobs execute immediately (fire-and-forget),
 * repeatable jobs use setInterval. No Redis or external dependencies needed.
 *
 * Safe to use in development and testing. Not suitable for production since
 * jobs are lost if the process restarts.
 */
export class NoopQueueAdapter implements QueuePort {
  private readonly handlers = new Map<string, JobHandler>();
  private readonly intervals: NodeJS.Timeout[] = [];

  register<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler);
  }

  async add<T>(name: string, data: T, _options?: JobOptions): Promise<void> {
    const handler = this.handlers.get(name);
    if (!handler) {
      log.warn({ name }, 'No handler registered for job — skipping');
      return;
    }

    log.info({ name }, '🔧 [queue:add] running job in-process');

    // Fire-and-forget — errors are caught so they never crash the caller
    handler(data).catch((err: unknown) => {
      log.error({ err, name }, 'In-process job failed');
    });
  }

  async schedule<T>(
    name: string,
    data: T,
    repeat: RepeatOptions,
    _options?: JobOptions
  ): Promise<void> {
    const handler = this.handlers.get(name);
    if (!handler) {
      log.warn({ name }, 'No handler registered for scheduled job — skipping');
      return;
    }

    const run = () =>
      handler(data).catch((err: unknown) => {
        log.error({ err, name }, 'Scheduled in-process job failed');
      });

    if (repeat.immediately) {
      void run();
    }

    if (repeat.every) {
      const interval = setInterval(() => void run(), repeat.every);
      this.intervals.push(interval);
      log.info(
        { name, everyMs: repeat.every },
        '🔧 [queue:schedule] registered in-process interval'
      );
    }
  }

  async start(): Promise<void> {
    // No-op — handlers run inline when add()/schedule() are called
  }

  async close(): Promise<void> {
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.length = 0;
  }
}
