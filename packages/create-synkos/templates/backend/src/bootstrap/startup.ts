/**
 * Async startup hooks.
 *
 * Each hook runs once during boot, after the database connection is established
 * and before the HTTP server starts. Hooks are awaited in order — a thrown
 * error aborts startup.
 *
 * EXAMPLE
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { warmCatalogCache } from "@/features/catalog/cache-warmer";
 *
 *   export const startupHooks: StartupHook[] = [
 *     warmCatalogCache,
 *   ];
 * ─────────────────────────────────────────────────────────────────────────────
 */
export type StartupHook = () => Promise<void>;

export const startupHooks: StartupHook[] = [
  // Add startup hooks here.
];
