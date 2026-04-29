---
'create-synkos': patch
---

Two scaffold fixes that unblock real-world setups out of the box:

- **Backend tsconfig**: `tsconfig.json` now uses `module: ESNext` +
  `moduleResolution: bundler` for the IDE/typecheck path, and
  `tsconfig.build.json` overrides to `module: Node16` +
  `moduleResolution: Node16` for the CJS emit. Both honor the `exports` field
  of `@synkos/server`, so subpath imports (`@synkos/server/middleware`,
  `/modules/auth`, …) resolve under `tsc --noEmit` and the build, instead of
  failing with TS2307 "Cannot find module" until the consumer rewrites their
  resolver.

- **Frontend router mode**: `quasar.config.ts` selects history mode for web
  and hash mode for Capacitor (`ctx.mode.capacitor ? 'hash' : 'history'`).
  Hash mode broke OAuth providers that strip the URL fragment from the
  redirect URI (RFC 6749 §3.1.2) — the SPA never reached its callback page.
  Web/PWA deploys to a static host need a catch-all rewrite to `index.html`;
  document this in the host's config.
