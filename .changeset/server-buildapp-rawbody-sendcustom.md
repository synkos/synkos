---
'@synkos/server': minor
---

Three additive backend features:

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
