---
'synkos': minor
---

New `synkos/vite` sub-export shipping the recommended Vite settings every Synkos app needs in its `quasar.config.ts`. Without these, Vite discovers tab pages and Capacitor plugins on first navigation, triggers a dep optimization re-run and the dev server reloads — visible to the user as a white flash on the first tab change.

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
