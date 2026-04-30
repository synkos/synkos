import { defineConfig } from 'tsup';

// All three configs run in parallel under tsup. Putting `clean: true` on
// any one of them races against the other two: an entry that finishes its
// .d.ts emit before the cleaner runs sees its output wiped — which is how
// `vite.d.ts` / `vite.d.cts` slipped out of the published 0.3.0 tarball
// despite both being built locally. Turn off in-tsup cleaning entirely
// and let the `clean` script (`rm -rf dist`) wired to `prebuild` run
// once, before tsup starts.

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
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
