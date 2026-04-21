import { createRuntime, definePlugin, defineConfig } from '@synkos/runtime';
import { slugify, toPascalCase, Errors, isAppError } from '@synkos/utils';

// ─── Utils demo ───────────────────────────────────────────────────────────────

console.log('\n── @synkos/utils ────────────────────────────────────────────');
console.log('slugify("Hello World!")     =>', slugify('Hello World!'));
console.log('toPascalCase("my-app-name") =>', toPascalCase('my-app-name'));

const err = Errors.notFound('User');
console.log('Errors.notFound().toJSON()  =>', JSON.stringify(err.toJSON()));
console.log('isAppError(err)             =>', isAppError(err));

// ─── Runtime demo ─────────────────────────────────────────────────────────────

console.log('\n── @synkos/runtime ──────────────────────────────────────────');

const logPlugin = definePlugin({
  name: 'logger',
  setup(ctx) {
    ctx.hook('onInit', async () => {
      console.log('[logger] onInit  — setting up logger');
    });
    ctx.hook('onReady', () => {
      console.log('[logger] onReady — app is ready');
    });
    ctx.hook('onDispose', () => {
      console.log('[logger] onDispose — flushing logs');
    });
  },
});

const dbPlugin = definePlugin({
  name: 'database',
  setup(ctx) {
    ctx.hook('onInit', async () => {
      // Simulates an async connection
      await new Promise<void>((r) => setTimeout(r, 50));
      console.log('[database] onInit — connected (simulated)');
    });
    ctx.hook('onDispose', () => {
      console.log('[database] onDispose — disconnected');
    });
  },
});

const config = defineConfig({
  app: { name: 'Playground', version: '0.1.0' },
  plugins: [logPlugin, dbPlugin],
});

const runtime = createRuntime(config);

await runtime.init();
console.log('\nRuntime initialized. Disposing in 1s…');

await new Promise<void>((r) => setTimeout(r, 1000));
await runtime.dispose();

console.log('\nDone.\n');
