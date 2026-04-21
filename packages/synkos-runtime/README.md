# @synkos/runtime

Isomorphic plugin and lifecycle system for Synkos — works in both Node.js (backend) and browser (frontend).

Zero dependencies.

## Install

```bash
pnpm add @synkos/runtime
```

## Concepts

- **Plugin** — a named unit of setup logic that registers lifecycle hooks.
- **Runtime** — orchestrates plugins and calls lifecycle hooks in order.
- **Hook** — a named event (`onInit`, `onReady`, `onError`, `onDispose`).

## Usage

```ts
import { definePlugin, defineConfig, createRuntime } from '@synkos/runtime';

// 1. Define plugins
const dbPlugin = definePlugin({
  name: 'database',
  setup(ctx) {
    ctx.hook('onInit', async () => {
      await connectToDatabase();
    });
    ctx.hook('onDispose', async () => {
      await disconnectFromDatabase();
    });
  },
});

const cachePlugin = definePlugin({
  name: 'cache',
  setup(ctx) {
    ctx.hook('onInit', async () => {
      await warmUpCache();
    });
  },
});

// 2. Define config
const config = defineConfig({
  app: { name: 'MyApp', version: '1.0.0' },
  plugins: [dbPlugin, cachePlugin],
});

// 3. Create and start the runtime
const runtime = createRuntime(config);
await runtime.init(); // runs onInit → onReady for all plugins, in order

// On shutdown:
await runtime.dispose(); // runs onDispose for all plugins
```

## Lifecycle hooks

| Hook        | When                                                                |
| ----------- | ------------------------------------------------------------------- |
| `onInit`    | Before the app is ready. Use for setup (DB connect, cache warm-up). |
| `onReady`   | App is fully initialized.                                           |
| `onError`   | A hook or plugin threw. Receives the error as payload.              |
| `onDispose` | Graceful shutdown. Use for cleanup (close connections).             |

## Registering hooks from outside a plugin

```ts
const runtime = createRuntime(config);

runtime.hook('onReady', () => {
  console.log('App ready!');
});

await runtime.init();
```

## Module augmentation

Extend `SynkosConfig` with your own config sections:

```ts
// In your package's types.ts
import type { SynkosConfig } from '@synkos/runtime';

declare module '@synkos/runtime' {
  interface SynkosConfig {
    database?: {
      url: string;
      maxPoolSize?: number;
    };
  }
}
```

## Types

```ts
import type { SynkosPlugin, SynkosConfig, LifecycleHook, PluginContext } from '@synkos/runtime';
```
