import client from "prom-client";
import type { HttpRequestRecord, MetricsPort } from "@/ports/metrics.port";

/**
 * Prometheus metrics adapter — exposes standard HTTP metrics via GET /metrics.
 *
 * Registers:
 *   - Default Node.js metrics: event loop lag, GC, memory, active handles, CPU
 *   - http_requests_total:     counter by method, route, status_code
 *   - http_request_duration_ms: histogram by method, route
 *
 * Each instance uses its own isolated Registry so multiple instances
 * (e.g. in tests) don't share state.
 */
export class PrometheusMetricsAdapter implements MetricsPort {
  private readonly registry: client.Registry;
  private readonly httpRequestsTotal: client.Counter;
  private readonly httpRequestDuration: client.Histogram;

  readonly contentType: string;

  constructor() {
    this.registry = new client.Registry();

    // Collect default Node.js runtime metrics into this registry
    client.collectDefaultMetrics({ register: this.registry });

    this.httpRequestsTotal = new client.Counter({
      name:       "http_requests_total",
      help:       "Total number of HTTP requests",
      labelNames: ["method", "route", "status_code"],
      registers:  [this.registry],
    });

    this.httpRequestDuration = new client.Histogram({
      name:       "http_request_duration_ms",
      help:       "HTTP request duration in milliseconds",
      labelNames: ["method", "route"],
      buckets:    [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers:  [this.registry],
    });

    this.contentType = client.Registry.OPENMETRICS_CONTENT_TYPE;
  }

  recordHttpRequest({ method, route, statusCode, durationMs }: HttpRequestRecord): void {
    this.httpRequestsTotal.inc({ method, route, status_code: String(statusCode) });
    this.httpRequestDuration.observe({ method, route }, durationMs);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
