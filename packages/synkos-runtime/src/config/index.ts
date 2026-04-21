import type { SynkosConfig } from '../types/index.js';

/**
 * Defines the Synkos app configuration with full type inference.
 * A no-op at runtime — exists purely for TypeScript inference and IDE support.
 *
 * Place in a `synkos.config.ts` file at the root of your project.
 *
 * @example
 * // synkos.config.ts
 * import { defineConfig } from '@synkos/runtime';
 *
 * export default defineConfig({
 *   app: { name: 'MyApp', version: '1.0.0' },
 *   plugins: [analyticsPlugin],
 * });
 */
export function defineConfig(config: SynkosConfig): SynkosConfig {
  return config;
}
