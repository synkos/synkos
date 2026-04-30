import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2022',
    platform: 'neutral',
  },
  {
    // Vite helpers run in Node during build/config — keep them in their
    // own bundle so the runtime entry doesn't pull in `node:fs`/`node:path`.
    // We deliberately don't depend on `vite` types — see `src/vite.ts`.
    entry: { vite: 'src/vite.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2022',
    platform: 'node',
  },
  {
    entry: { bin: 'src/bin.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    target: 'es2022',
    platform: 'node',
    banner: { js: '#!/usr/bin/env node' },
  },
]);
