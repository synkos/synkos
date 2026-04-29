# @synkos/server

## 0.3.0

### Minor Changes

- 75a5413: Three additive backend features:
  - **`buildApp(config)`**: synchronous Express app construction without
    `connectDatabase()` or `app.listen()`. Use it in tests with
    `supertest(buildApp(config))`, or anywhere the caller wants to own the
    lifecycle. Runs the same `extensions` / `listeners` / `wireCoreAdapters` /
    `adapters` hooks as `createApp`. `createApp` keeps its existing signature.
  - **`req.rawBody`**: the framework body parser now captures the raw JSON
    bytes on every request (`Buffer`), so route handlers can validate webhook
    HMAC signatures with `crypto.timingSafeEqual` instead of re-serializing the
    parsed JSON (which is not byte-equal). Configure the parser size with
    `AppConfig.bodyParser.jsonLimit` (default `1mb`). The Express.Request
    augmentation is published as a side-effect import from `@synkos/server`,
    so any consumer picks up the typing automatically.
  - **`EmailPort.sendCustom`**: new method for transactional emails outside the
    built-in auth flows (reminders, alerts, digests). Apps build their own HTML
    and the adapter forwards it untouched, so the auth-specific branding doesn't
    leak into product emails. Built-in `ConsoleEmailAdapter` and
    `ResendEmailAdapter` implement it (Resend forwards `text`, `replyTo`,
    `headers` through). Custom `EmailPort` implementations must add the method
    — minor bump because this is a contract widening.

### Patch Changes

- 3cbc2a0: Make Mongoose model registration idempotent across subpath bundles.

  `RefreshToken`, `AuditLog` and `ReservedUsername` now use the same `defineModel` helper
  that the `User` model already used, so importing both `@synkos/server` and one of its
  subpaths (e.g. `@synkos/server/middleware`) in the same process no longer throws
  `OverwriteModelError: Cannot overwrite \`X\` model once compiled`.

  Apps that worked around this by monkey-patching `mongoose.model` can drop that shim.

- 8370733: Expose per-condition types in `package.json` exports so consumers under
  `moduleResolution: "Node16" | "NodeNext"` can statically import the package
  and its subpaths from a CommonJS context. Each export entry now publishes
  the matching `.d.ts` for ESM importers and `.d.cts` for CJS importers, which
  removes the spurious "ECMAScript module imported via require" TS1479 errors
  when typechecking or building a CJS app against `@synkos/server`.

## 0.2.0

### Minor Changes

- Initial public release of the Synkos framework ecosystem.
  - `create-synkos` — CLI scaffolder for fullstack, frontend, and backend projects
  - `synkos` — Frontend core: `defineAppConfig`, `createSynkosPlugin`, `useAppConfig`, `createAuthGuard`
  - `@synkos/ui` — iOS-styled Vue 3 + Quasar component library with design tokens
  - `@synkos/server` — Express 5 + Mongoose 9 backend framework with auth, user, and adapter system
  - `@synkos/runtime` — Isomorphic plugin and lifecycle hook system
  - `@synkos/utils` — Zero-dependency utilities: types, string, object, error, env
  - `@synkos/config` — Shared ESLint 9, Prettier, and TypeScript configs
