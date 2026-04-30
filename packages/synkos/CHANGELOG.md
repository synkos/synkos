# synkos

## 0.3.1

### Patch Changes

- a022d15: Fix race in `tsup` build that occasionally dropped `dist/vite.d.ts` and `dist/vite.d.cts` from the published tarball (visible in `synkos@0.3.0`, where importing `synkos/vite` from a TypeScript app surfaced `Could not find a declaration file for module 'synkos/vite'`).

  `tsup`'s array config runs each entry in parallel. Setting `clean: true` on any one entry races against the others — entries that finished their `.d.ts` emit before the cleaner ran got their output wiped. The published `vite.js` was on the lucky side of the race, but `vite.d.ts` lost out at publish time.

  Fix is a one-liner: drop `clean: true` from inside the tsup configs and run `rm -rf dist` once via a `prebuild` script before tsup starts. Locally re-verified across five back-to-back builds — every dist tree consistently contains all four `.d.ts` / `.d.cts` files.

  Also align the `vue-router` peer-dep range to `^5.0.0` to match what the rest of the workspace and every Synkos app actually uses (`^4.0.0` was a stale leftover that caused `unmet peer` warnings on every install).

## 0.3.0

### Minor Changes

- 7a3f159: New `synkos/vite` sub-export shipping the recommended Vite settings every Synkos app needs in its `quasar.config.ts`. Without these, Vite discovers tab pages and Capacitor plugins on first navigation, triggers a dep optimization re-run and the dev server reloads — visible to the user as a white flash on the first tab change.

  The fix replaces a ~50-line block of boilerplate with a one-liner:

  ```ts
  import { synkosExtendViteConf } from 'synkos/vite'

  build: {
    extendViteConf(viteConf) {
      synkosExtendViteConf(viteConf)
    }
  }
  ```

  What it does:
  - Spreads `SYNKOS_OPTIMIZE_DEPS` (`@synkos/ui`, `@synkos/client`, vue-i18n + intlify internals, every Capacitor plugin Synkos may dynamic-import) into `optimizeDeps.include`.
  - Sets `resolve.preserveSymlinks` and merges `SYNKOS_DEDUPE` (`vue` / `vue-router` / `pinia` / `vue-i18n`) into `resolve.dedupe`.
  - Auto-discovers tab pages from `src/features/*/pages/*Page.vue` plus the conventional auth/profile pages and adds them to `server.warmup.clientFiles`. Apps with non-conventional layouts pass `extraWarmupFiles` to top up.

  The structural Vite-config type is defined locally instead of imported from `vite`, so the helper compiles cleanly against any Vite major (Quasar 2 ships Vite 6, future Quasar may ship 7+).

## 0.2.1

### Patch Changes

- 2fd46b6: fix synkos dev ios not opening Xcode when xcworkspace does not exist yet

## 0.2.0

### Minor Changes

- fdeeef3: add `synkos` CLI with `synkos dev ios` command

## 0.1.0

### Minor Changes

- Initial public release of the Synkos framework ecosystem.
  - `create-synkos` — CLI scaffolder for fullstack, frontend, and backend projects
  - `synkos` — Frontend core: `defineAppConfig`, `createSynkosPlugin`, `useAppConfig`, `createAuthGuard`
  - `@synkos/ui` — iOS-styled Vue 3 + Quasar component library with design tokens
  - `@synkos/server` — Express 5 + Mongoose 9 backend framework with auth, user, and adapter system
  - `@synkos/runtime` — Isomorphic plugin and lifecycle hook system
  - `@synkos/utils` — Zero-dependency utilities: types, string, object, error, env
  - `@synkos/config` — Shared ESLint 9, Prettier, and TypeScript configs
