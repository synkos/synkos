import { NoopMetricsAdapter } from "./noop.metrics-adapter";
import type { MetricsPort } from "@/ports/metrics.port";

/**
 * Module-level singleton. Starts with the noop adapter — zero overhead
 * until a concrete provider is registered in bootstrap/adapters.ts.
 */
let adapter: MetricsPort = new NoopMetricsAdapter();

export function setMetricsAdapter(impl: MetricsPort): void {
  adapter = impl;
}

export function getMetricsAdapter(): MetricsPort {
  return adapter;
}
