# synkos

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
