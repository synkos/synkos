import type { HttpRequestRecord, MetricsPort } from "@/ports/metrics.port";

/**
 * Noop metrics adapter — default when no metrics provider is configured.
 *
 * All operations are no-ops. GET /metrics returns 404.
 * Zero overhead — no counters, no histograms, no memory allocation.
 */
export class NoopMetricsAdapter implements MetricsPort {
  readonly contentType = "text/plain";

  recordHttpRequest(_record: HttpRequestRecord): void {
    // no-op
  }

  async getMetrics(): Promise<string | null> {
    return null;
  }
}
