import type {
  SynkosPlugin,
  SynkosConfig,
  ResolvedConfig,
  LifecycleHook,
  LifecycleHandler,
  PluginContext,
  RuntimeState,
} from '../types/index.js';

export class SynkosRuntime {
  private readonly _config: ResolvedConfig;
  private readonly _plugins: SynkosPlugin[] = [];
  private readonly _hooks = new Map<LifecycleHook, LifecycleHandler[]>();
  private _state: RuntimeState = 'idle';

  constructor(config: SynkosConfig = {}) {
    this._config = Object.freeze({ ...config });

    // Pre-register plugins declared in config
    for (const plugin of config.plugins ?? []) {
      this.use(plugin);
    }
  }

  get state(): RuntimeState {
    return this._state;
  }

  get config(): ResolvedConfig {
    return this._config;
  }

  /**
   * Register a plugin. Plugins with duplicate names are ignored.
   * Must be called before `init()`.
   */
  use(plugin: SynkosPlugin): this {
    if (this._state !== 'idle') {
      throw new Error(
        `Cannot register plugin "${plugin.name}" after the runtime has been initialized.`
      );
    }
    const isDuplicate = this._plugins.some((p) => p.name === plugin.name);
    if (!isDuplicate) {
      this._plugins.push(plugin);
    }
    return this;
  }

  /**
   * Register a lifecycle handler directly on the runtime (without a plugin).
   * Useful for one-off hooks in app bootstrap code.
   */
  hook(event: LifecycleHook, handler: LifecycleHandler): void {
    const existing = this._hooks.get(event) ?? [];
    this._hooks.set(event, [...existing, handler]);
  }

  /**
   * Run all handlers registered for a lifecycle event, in order.
   * Errors in handlers bubble up unless caught by an `onError` handler.
   */
  async callHook(event: LifecycleHook, payload?: unknown): Promise<void> {
    const handlers = this._hooks.get(event) ?? [];
    for (const handler of handlers) {
      await handler(payload as never);
    }
  }

  /**
   * Initialize the runtime: run all plugin `setup` functions, then fire `onInit` and `onReady`.
   * Safe to await — rejects if any plugin setup or hook throws.
   */
  async init(): Promise<void> {
    if (this._state !== 'idle') {
      throw new Error(`Runtime is already in state "${this._state}". Call init() only once.`);
    }

    this._state = 'initializing';

    try {
      const ctx = this._buildPluginContext();

      for (const plugin of this._plugins) {
        await plugin.setup(ctx);
      }

      await this.callHook('onInit');
      await this.callHook('onReady');

      this._state = 'ready';
    } catch (err) {
      await this.callHook('onError', err).catch(() => {});
      this._state = 'idle';
      throw err;
    }
  }

  /**
   * Gracefully shut down the runtime, firing `onDispose` hooks.
   */
  async dispose(): Promise<void> {
    if (this._state === 'disposed') return;

    try {
      await this.callHook('onDispose');
    } finally {
      this._state = 'disposed';
    }
  }

  private _buildPluginContext(): PluginContext {
    return {
      config: this._config,
      hook: (event: LifecycleHook, handler: LifecycleHandler) => {
        this.hook(event, handler);
      },
    };
  }
}

/**
 * Create a new Synkos runtime instance.
 *
 * @example
 * const runtime = createRuntime({ app: { name: 'MyApp' }, plugins: [myPlugin] });
 * await runtime.init();
 */
export function createRuntime(config?: SynkosConfig): SynkosRuntime {
  return new SynkosRuntime(config);
}
