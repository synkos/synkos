/**
 * Project-level custom adapters.
 *
 * Core adapters (email, storage, queue, cache, notifications) are auto-wired
 * by @synkos/server based on your environment variables — no configuration needed here.
 *
 * Use this file only to register adapters that are NOT provided by the core,
 * or to override a core adapter with a custom implementation.
 *
 * EXAMPLE — override the email adapter with a custom provider:
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { setEmailAdapter } from "@synkos/server/adapters";
 *   import { MyCustomEmailAdapter } from "@/features/email/my-custom.adapter";
 *
 *   export function wireAdapters(): void {
 *     setEmailAdapter(new MyCustomEmailAdapter());
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function wireAdapters(): void {
  // Register custom adapters here.
}
