import { NoopQueueAdapter } from './noop.queue-adapter';
import type { QueuePort } from '@/ports/queue.port';

/**
 * Module-level singleton. Starts with the noop adapter so the app is safe
 * to boot with no Redis configuration — jobs run in-process and are logged.
 *
 * Projects call setQueueAdapter() in bootstrap/adapters.ts (imported before
 * any module that could enqueue a job).
 */
let adapter: QueuePort = new NoopQueueAdapter();

export function setQueueAdapter(impl: QueuePort): void {
  adapter = impl;
}

export function getQueueAdapter(): QueuePort {
  return adapter;
}
