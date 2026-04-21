import type { SynkosPlugin } from '../types/index.js';

/**
 * Defines a Synkos plugin with full type inference.
 * A no-op at runtime — exists purely for TypeScript inference and IDE support.
 *
 * @example
 * export const analyticsPlugin = definePlugin({
 *   name: 'analytics',
 *   setup(ctx) {
 *     ctx.hook('onReady', () => {
 *       console.log('App ready — analytics initialized');
 *     });
 *   },
 * });
 */
export function definePlugin(plugin: SynkosPlugin): SynkosPlugin {
  return plugin;
}
