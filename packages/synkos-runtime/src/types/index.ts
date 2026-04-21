// ── Lifecycle ─────────────────────────────────────────────────────────────────

/**
 * Built-in lifecycle events fired by the runtime in order:
 *
 * onInit     → plugins are being set up (before app boots)
 * onReady    → app fully initialized and ready to accept traffic / render
 * onError    → an unhandled error occurred
 * onDispose  → app is shutting down gracefully
 */
export type LifecycleHook = 'onInit' | 'onReady' | 'onError' | 'onDispose';

export type LifecycleHandler<T = void> = (payload?: T) => void | Promise<void>;

// ── Plugin ────────────────────────────────────────────────────────────────────

/**
 * The context object passed to a plugin's `setup` function.
 * Provides access to the resolved config and the hook registration API.
 */
export interface PluginContext {
  /** Resolved app configuration. */
  readonly config: ResolvedConfig;
  /**
   * Register a handler for a lifecycle event.
   * Handlers are called in the order they were registered.
   */
  hook(event: LifecycleHook, handler: LifecycleHandler): void;
}

/**
 * A Synkos plugin — the primary extension point of the framework.
 *
 * @example
 * export const myPlugin = definePlugin({
 *   name: 'my-plugin',
 *   setup(ctx) {
 *     ctx.hook('onInit', async () => {
 *       // runs before the app boots
 *     });
 *   },
 * });
 */
export interface SynkosPlugin {
  /** Unique plugin identifier. Used for deduplication and debug output. */
  name: string;
  /** Called once during runtime initialization with the plugin context. */
  setup(ctx: PluginContext): void | Promise<void>;
}

// ── Config ────────────────────────────────────────────────────────────────────

/**
 * Base Synkos configuration.
 * Extended by `synkos` (frontend) and `@synkos/server` (backend) with their own options.
 *
 * @example
 * // synkos.config.ts
 * import { defineConfig } from '@synkos/runtime';
 * export default defineConfig({ app: { name: 'MyApp' }, plugins: [myPlugin] });
 */
export interface SynkosConfig {
  app?: {
    name?: string;
    version?: string;
  };
  /** Plugins to register. Loaded in array order. */
  plugins?: SynkosPlugin[];
  /**
   * Allow packages to attach their own config sections via module augmentation.
   *
   * @example
   * // In the synkos frontend package:
   * declare module '@synkos/runtime' {
   *   interface SynkosConfig {
   *     quasar?: QuasarConfig;
   *     capacitor?: CapacitorConfig;
   *   }
   * }
   */
  [key: string]: unknown;
}

/** The fully resolved, read-only config used at runtime. */
export type ResolvedConfig = Readonly<SynkosConfig>;

// ── Runtime ───────────────────────────────────────────────────────────────────

export type RuntimeState = 'idle' | 'initializing' | 'ready' | 'disposed';
