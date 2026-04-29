---
title: Router
description: "Factories and helpers for the Synkos navigation layer."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

Factories and helpers for the Synkos navigation layer.

## createSynkosRouter

<small>function</small>

```ts
function createSynkosRouter(options: SynkosRouterOptions): Router
```

---

## getPostAuthRoute

<small>function</small>

Read the current post-auth target. The default is the first user-declared
tab route (or `homeRouteName` in `setupSynkosRouter`), with `{ name: 'home' }`
as the final fallback. Use this in user-owned auth pages instead of hardcoding
a route name so that renaming the landing route never breaks the auth flow.

```ts
function getPostAuthRoute(): string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
```

**Example**

```ts
```ts
await router.replace(getPostAuthRoute())
```
```

---

## setPostAuthRoute

<small>function</small>

Override the route the user is redirected to after a successful auth event
(login, OTP verify, biometric unlock, deletion cancel). Useful for one-time
onboarding flows: call this from your post-login boot step before navigation
runs, then call it again with the canonical home once onboarding completes.

```ts
function setPostAuthRoute(route: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric): void
```

**Example**

```ts
```ts
setPostAuthRoute({ name: 'onboarding-welcome' })
```
```

---

## setupSynkosRouter

<small>function</small>

```ts
function setupSynkosRouter(router: Router, options: SynkosSetupOptions): void
```

---

## synkosSettingsRoutes

<small>function</small>

```ts
function synkosSettingsRoutes(config?: SettingsConfig): RouteRecordRaw[]
```
