/**
 * Background jobs.
 *
 * Register job handlers and recurring schedules here.
 * Requires REDIS_URL to be set — jobs are no-ops without a queue adapter.
 *
 * EXAMPLE
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { getQueueAdapter } from "@synkos/server/adapters";
 *   import { DigestService }   from "@/features/digest/digest.service";
 *
 *   export function registerJobs(): void {
 *     const queue = getQueueAdapter();
 *
 *     queue.register("send-weekly-digest", async (data: { userId: string }) => {
 *       await DigestService.sendForUser(data.userId);
 *     });
 *   }
 *
 *   export async function scheduleJobs(): Promise<void> {
 *     const queue = getQueueAdapter();
 *
 *     await queue.schedule("send-weekly-digest", {}, { every: 7 * 24 * 60 * 60 * 1000 });
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function registerJobs(): void {
  // Register job handlers here.
}

export async function scheduleJobs(): Promise<void> {
  // Schedule recurring jobs here.
}
