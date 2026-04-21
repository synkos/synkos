/**
 * Contract that every metrics adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider (Prometheus, etc.).
 * Projects provide their implementation via setMetricsAdapter() in bootstrap/adapters.ts.
 *
 * Two adapters are provided out of the box:
 *   - NoopMetricsAdapter       — no-op (default, zero overhead)
 *   - PrometheusMetricsAdapter — prom-client, exposes GET /metrics
 */
export interface HttpRequestRecord {
  method: string;
  /** Matched route pattern — e.g. /api/v1/user/:id, not /api/v1/user/abc123 */
  route: string;
  statusCode: number;
  durationMs: number;
}

export interface MetricsPort {
  /**
   * Record a completed HTTP request. Called by the metrics middleware
   * after every response. No-op if metrics are not configured.
   */
  recordHttpRequest(record: HttpRequestRecord): void;

  /**
   * Returns the metrics payload for the GET /metrics endpoint.
   * Returns null if this adapter does not expose metrics (noop).
   */
  getMetrics(): Promise<string | null>;

  /**
   * Content-Type header value for the GET /metrics response.
   * Prometheus expects 'text/plain; version=0.0.4; charset=utf-8'.
   */
  readonly contentType: string;
}
