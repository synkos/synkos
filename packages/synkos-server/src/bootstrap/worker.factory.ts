import { connectDatabase } from '@/config/database';
import { wireAdapters as wireCoreAdapters } from '@/bootstrap/wire-adapters';
import { getQueueAdapter } from '@/adapters/queue/queue.registry';
import { logger } from '@/utils/logger';

export interface WorkerConfig {
  /** Called first — Mongoose schema patches and core hooks */
  extensions?: () => void;
  /** Called second — domain event subscriptions */
  listeners?: () => void;
  /** Called third — project-level adapter overrides */
  adapters?: () => void;
  /** Registers job handlers (sync) */
  registerJobs?: () => void;
  /** Schedules recurring jobs (async) */
  scheduleJobs?: () => Promise<void>;
}

export async function startWorker({
  extensions,
  listeners,
  adapters,
  registerJobs,
  scheduleJobs,
}: WorkerConfig = {}): Promise<void> {
  try {
    extensions?.();
    listeners?.();
    wireCoreAdapters();
    adapters?.();

    await connectDatabase();

    registerJobs?.();
    await getQueueAdapter().start();
    await scheduleJobs?.();

    logger.info('Worker started');

    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutting down worker — draining in-flight jobs');
      await getQueueAdapter().close();
      process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Worker startup error — shutting down');
    process.exit(1);
  }
}
