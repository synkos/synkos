# Synkos — Technical Reference

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Package graph and build system](#2-package-graph-and-build-system)
3. [@synkos/client internals](#3-synkosclient-internals)
4. [Auth lifecycle](#4-auth-lifecycle)
5. [API client design](#5-api-client-design)
6. [Store architecture](#6-store-architecture)
7. [Boot system](#7-boot-system)
8. [i18n architecture](#8-i18n-architecture)
9. [Router architecture](#9-router-architecture)
10. [@synkos/server internals](#10-synkosserver-internals)
11. [Template sync pipeline](#11-template-sync-pipeline)
12. [Security model](#12-security-model)
13. [Versioning and the semver contract](#13-versioning-and-the-semver-contract)

---

## 1. Architecture overview

### Design philosophy

Synkos follows the same design principle for both frontend and backend: **the framework owns the core, the user owns the shell**. All non-trivial infrastructure lives in published npm packages; what the user receives is a thin bootstrap layer with clearly marked extension points.

```
Backend                              Frontend
─────────────────────────────────    ────────────────────────────────────
@synkos/server                       @synkos/client
  [core: auth, user, account,          [core: stores, services,
   username, notifications,             composables, boot factories,
   adapters, events]                    i18n strings]
        ↑                                      ↑
apps/backend (thin shell)            apps/frontend (thin shell)
  server.ts → createApp({              boot/ → createXBoot({ config })
    modules,                           features/ → your feature pages
    extensions,                        router/routes/app.routes.ts
    listeners,                         i18n/en-US/ → app-specific strings
    adapters,                          css/quasar.variables.scss
    startupHooks })
```

When a bug is fixed or a security patch is released in a core package, users update with `pnpm update @synkos/client` or `pnpm update @synkos/server`. Their application code does not need to change.

### Separation of concerns

The framework is split into packages by responsibility:

| Package           | Responsibility                                         | Runtime             |
| ----------------- | ------------------------------------------------------ | ------------------- |
| `synkos`          | Vue plugin, app config contract, auth guard            | Browser             |
| `@synkos/client`  | Auth store, API client, services, boot factories, i18n | Browser + Capacitor |
| `@synkos/ui`      | Reusable Vue components                                | Browser             |
| `@synkos/server`  | Express framework, core API modules, adapters          | Node.js             |
| `@synkos/utils`   | Zero-dependency utilities                              | Both                |
| `@synkos/runtime` | Isomorphic plugin system (experimental)                | Both                |
| `@synkos/config`  | Shared ESLint, Prettier, TypeScript configs            | Build-time          |

---

## 2. Package graph and build system

### Dependency graph

```
create-synkos
    └── templates/frontend, templates/backend (build artifacts)

synkos ──────────────────────────────┐
@synkos/client ──────────────────────┤ consumed by apps/frontend
  └── synkos (AppConfig type)        │
  └── axios (bundled)                │
@synkos/ui ──────────────────────────┘

@synkos/server ──────────────────────┐ consumed by apps/backend
  └── @synkos/utils                  │
  └── mongoose, express, zod, etc.   │
                                     ┘

@synkos/utils ← used by @synkos/server
@synkos/config ← used by all packages (dev only)
```

### Build tooling decisions

| Package          | Bundler         | Why                                                                         |
| ---------------- | --------------- | --------------------------------------------------------------------------- |
| `synkos`         | tsup            | TypeScript-only, needs ESM + CJS dual format, no framework coupling         |
| `@synkos/client` | tsup            | TypeScript-only (no Vue SFCs), dynamic imports for Capacitor plugins        |
| `@synkos/ui`     | Vite (lib mode) | Contains Vue SFCs requiring `@vitejs/plugin-vue` for compilation            |
| `@synkos/server` | tsup            | TypeScript-only Node.js package, large code split via multiple entry points |
| `@synkos/utils`  | tsup            | Zero-dep, needs to work in both browser and Node                            |

#### Why tsup over Vite for `@synkos/client`

`@synkos/client` contains no `.vue` files — only TypeScript. tsup is significantly faster than Vite for pure TS packages, generates clean ESM + CJS dual format, and produces proper `.d.ts` declarations via `dts: true`. Vite in library mode is only needed when Vue SFCs are involved.

#### Why `platform: 'neutral'` in tsup configs

Setting `platform: 'neutral'` (vs `'node'` or `'browser'`) tells esbuild not to inject Node.js or browser globals that would break in the opposite environment. All Capacitor plugin imports in `@synkos/client` are dynamic (`await import('@capacitor/...')`) precisely so they can be tree-shaken in web-only contexts.

#### External vs bundled dependencies

`@synkos/client`'s tsup config marks peer dependencies as external (they're not bundled):

- `vue`, `vue-router`, `pinia`, `vue-i18n` → external (the consuming app provides them)
- `axios` → bundled as a direct dependency (versioning is tight)
- Capacitor packages → not explicitly listed, but since they're dynamic imports, esbuild does not include them in the static bundle

---

## 3. @synkos/client internals

### The three singleton bridges

The package uses three module-level singletons to break dependencies that would create circular imports or force the package to know about the consuming app's file structure:

#### 1. Config singleton (`internal/app-config.ts`)

```typescript
let _config: AppConfig | null = null;
export const setClientConfig = (config: AppConfig): void => {
  _config = config;
};
export const getClientConfig = (): AppConfig => {
  /* throws if not set */
};
```

**Why:** Stores and services need `AppConfig` (for storage keys, app name in biometric prompt, push token keys) but cannot import `src/app.config` because they live in a package. `createAuthBoot()` calls `setClientConfig(config)` before any store or service runs.

**Timing guarantee:** `createAuthBoot()` is a Quasar boot file that runs synchronously before the router resolves any route. By the time any store action runs, the config is always available.

#### 2. i18n bridge (`internal/i18n-bridge.ts`)

```typescript
let _setLocale: (lang: string) => void = () => undefined;
export const registerSetLocale = (fn: (lang: string) => void): void => {
  _setLocale = fn;
};
export const setLocale = (lang: string): void => {
  _setLocale(lang);
};
```

**Why:** `useSettingsStore.setAppLang()` needs to change the active vue-i18n locale when the user switches language. But the i18n instance is created in the boot file (it needs to be registered with the Vue app via `app.use(i18n)`), not in a module. Exporting the instance would create a circular chain.

The bridge decouples them: the boot file calls `registerSetLocale()` once after creating the i18n instance, and the store calls `setLocale()` which is just an indirection to that function.

**Fallback:** The default `_setLocale` is a no-op. If someone calls `setLocale()` before `createI18nBoot()` runs, nothing breaks — the locale just doesn't change. This cannot happen in practice because the boot order places `i18n` before `auth`, and stores are only called after boot completes.

#### 3. Token provider (`api/token-provider.ts`)

```typescript
let _getToken: () => string | null = () => null;
export const registerTokenProvider = (fn: () => string | null): void => {
  _getToken = fn;
};
export const getAccessToken = (): string | null => _getToken();
```

**Why:** The API client needs the current access token on every request, but it cannot import `useAuthStore` at module initialization time because that creates a circular dependency (`api → auth.store → api`). The previous solution read from `window.__pinia.state.value.auth.accessToken` — a brittle hack that breaks when Pinia's internal structure changes.

The token provider is registered inside `useAuthStore`'s setup function:

```typescript
// In auth.store.ts (inside defineStore callback)
registerTokenProvider(() => accessToken.value);
```

This runs once when the store is first accessed (which happens during boot), before any API call is made. The provider is a closure over the `accessToken` ref, so it always returns the live value.

### Dynamic imports for Capacitor plugins

All Capacitor plugins in `@synkos/client` are loaded via dynamic import:

```typescript
const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
const { PushNotifications } = await import('@capacitor/push-notifications');
```

**Reasons:**

1. **Web compatibility** — Capacitor plugins throw on web if imported statically. Dynamic import lets the calling code guard with `if (Capacitor.isNativePlatform())` before importing.
2. **Bundle size** — The app's bundler (Vite/Quasar) can tree-shake these imports when building for web.
3. **Optional dependencies** — Users who don't enable `faceId` or `pushNotifications` never load those plugins.

---

## 4. Auth lifecycle

### Cold start sequence

```
App launch
    │
    ├─ [boot: i18n] createI18nBoot()
    │     └─ reads persisted locale from localStorage
    │     └─ creates vue-i18n instance, registers setLocale bridge
    │
    ├─ [boot: auth] createAuthBoot()
    │     ├─ setClientConfig(appConfig)
    │     ├─ createApiClient(baseURL)        → registers Axios interceptors
    │     ├─ CapApp.addListener('appStateChange') → writes backgroundedAt on pause
    │     └─ authStore.initialize()
    │           │
    │           ├─ load biometricAsked flag (never cleared on logout)
    │           │
    │           ├─ [guest path] guestFlag === 'true'?
    │           │     └─ isGuest = true, isInitialized = true → 'guest'
    │           │
    │           ├─ [no session path] no refresh token in Keychain?
    │           │     └─ isInitialized = true → 'no-session'
    │           │
    │           ├─ [biometric path] biometricEnabled && outside grace window?
    │           │     ├─ promptBiometric() → native Face ID prompt
    │           │     ├─ 'passed'     → continue to refresh
    │           │     ├─ 'cancelled'  → isInitialized = true → 'biometric-cancelled'
    │           │     └─ 'unavailable' → skip silently, continue to refresh
    │           │
    │           ├─ loadUser() → populate user ref from Preferences cache (instant UI)
    │           │
    │           ├─ AuthService.refresh(storedToken) → POST /auth/refresh
    │           │     ├─ success → save new refreshToken, set accessToken in memory
    │           │     └─ failure → clearAllStorage(), return 'refresh-failed'
    │           │
    │           ├─ AuthService.getMe() in background → update user ref
    │           └─ isInitialized = true → 'restored'
    │
    ├─ [auth boot result handling]
    │     ├─ 'biometric-cancelled' → router.replace({ name: 'auth-login' })
    │     └─ 'refresh-failed'     → router.replace({ name: 'auth-login' })
    │
    ├─ [boot: notifications] notificationsService.init()
    │
    └─ [boot: splash] SplashScreen.hide()
```

### Why `loadUser()` before the refresh call

The user's display name and avatar are loaded from a `@capacitor/preferences` cache before the network refresh completes. This means the app renders immediately with the correct user data — no loading skeleton for the username or avatar. If the background `getMe()` returns a newer version, the UI updates reactively.

### Biometric grace period

After a successful biometric authentication or app launch, the time is not recorded. The grace period is based on when the app was backgrounded:

```typescript
// When app goes to background:
await Preferences.set({ key: bgKey, value: String(Date.now()) });

// On initialize(), before biometric prompt:
const withinGrace = bgAt && Date.now() - parseInt(bgAt, 10) < 15 * 60 * 1000;
if (!withinGrace) {
  // show Face ID prompt
}
```

**Why 15 minutes?** Matches iOS's native behavior for biometric-protected apps. Within 15 minutes of backgrounding, the app resumes without asking again. This balances security (prompt on cold starts and long absences) with usability (no prompt on quick task switches).

**Why `backgroundedAt`, not `lastAuthAt`?** If we recorded `lastAuthAt`, a user who stayed in the app for 16 minutes without backgrounding would get prompted on the next background/restore cycle even though they've been actively using the app. `backgroundedAt` tracks the actual absence from the app.

### Token rotation

Every successful `POST /auth/refresh` returns a new access token AND a new refresh token. The old refresh token is immediately invalidated on the server:

```typescript
const tokens = await AuthService.refresh(storedRefreshToken);
await saveRefreshToken(tokens.refreshToken); // write new token to Keychain
accessToken.value = tokens.accessToken; // update in-memory token
```

**Security implication:** If a refresh token is stolen and the attacker uses it, the server rotates it. When the legitimate user's client next tries to refresh, the server rejects the (now-stale) token and the client logs the user out. The user loses their session and is prompted to log in, which reveals that something is wrong.

### Storage key derivation

All storage keys are derived from `appConfig.storageKeys.settings` to guarantee per-app isolation on shared devices:

```typescript
function getAuthKeys() {
  const prefix = storageKeys.settings.replace(/-settings$/, '');
  return {
    guest: `${prefix}-guest`,
    biometricEnabled: `${prefix}-biometric-enabled`,
    biometricAsked: `${prefix}-biometric-asked`,
    user: `${prefix}-user`,
    backgroundedAt: `${prefix}-backgrounded-at`,
    authProvider: `${prefix}-auth-provider`,
  };
}
```

`appConfig.storageKeys.settings` is set to `'myapp-settings'` in the user's `app.config.ts`. All auth keys inherit the `'myapp-'` prefix. If two Synkos apps are installed on the same device, they cannot accidentally share session data.

---

## 5. API client design

### The 401 retry queue

When multiple concurrent requests all receive 401 (token expired), only one token refresh should happen. The queue serializes retries:

```typescript
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// On 401:
if (isRefreshing) {
  // Another request is already refreshing — queue this one
  return new Promise((resolve, reject) => {
    refreshQueue.push((newToken) => {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      resolve(api(originalRequest)); // retry with new token
    });
    setTimeout(() => reject(error), 10000); // 10s timeout safety net
  });
}

// First 401 — take the refresh lock
isRefreshing = true;
originalRequest._retry = true;
const refreshed = await authStore.refreshTokens();

if (refreshed) {
  refreshQueue.forEach((cb) => cb(authStore.accessToken!));
  refreshQueue = [];
  return api(originalRequest); // retry the original
}
```

**The `_retry` flag** prevents an infinite loop: if the retried request also returns 401 (e.g. the refresh succeeded but the endpoint still rejects), we don't enter the refresh cycle again.

**The 10-second timeout** in the queue promise is a safety net for edge cases where the refresh takes unreasonably long and the queued callback is never called (e.g. network drops during the refresh call). Without it, those promises would hang indefinitely.

### Why not intercept `/auth/` routes

The response interceptor skips the retry logic for URLs containing `/auth/`:

```typescript
!originalRequest.url?.includes('/auth/');
```

The auth endpoints (`/auth/login`, `/auth/refresh`) have their own error handling in `LoginPage.vue`. If they returned 401, retrying them would be nonsensical (login with wrong credentials returns 401, not expired token) and potentially dangerous (refresh returning 401 means the token is invalid — logging out is the correct response, not an infinite retry loop).

### Access token injection via token provider

The request interceptor calls `getAccessToken()` which delegates to whatever was registered via `registerTokenProvider()`:

```typescript
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

The previous pattern (`window.__pinia.state.value.auth.accessToken`) worked but:

- Relied on Pinia's undocumented internal structure
- Would break if Pinia changed `state.value` to a different key
- Made the code untestable (no way to mock the global)
- Made it unclear that the API client depends on the auth store

The token provider is explicit, testable (just call `registerTokenProvider(() => 'mock-token')`), and resilient to Pinia version changes.

---

## 6. Store architecture

### Composition API stores (not Options API)

All stores use Pinia's composition API (`defineStore('id', () => { ... })`), not the options API (`defineStore('id', { state, getters, actions })`).

**Reasons:**

- Full TypeScript inference — no need to annotate `this` types
- Logic can be extracted into composables (shared between stores and components)
- Dynamic imports inside setup functions work naturally
- Computed values use Vue's standard `computed()` — no special `getters` syntax

### Circular dependency between `auth.store` and `settings.store`

`auth.store` needs to flush the push token when a session is restored, but `flushPendingToken()` reads `settingsStore.pushNotificationsEnabled` to decide whether to do it. If `auth.store` imported `settings.store` at the top level, and `settings.store` imported anything from `auth.store`, a cycle would form.

The solution: dynamic import at call site:

```typescript
// Inside auth.store.ts — called after session is restored
function flushPushTokenIfEnabled() {
  import('./settings.store.js')
    .then(({ useSettingsStore }) => {
      if (useSettingsStore().pushNotificationsEnabled) {
        void notificationsService.flushPendingToken();
      }
    })
    .catch(() => undefined);
}
```

The dynamic import is resolved lazily at runtime, breaking the static cycle. The `.catch(() => undefined)` is intentional — this is a "fire and forget" optimization (push registration is retried on the next login anyway).

### Why `$patch` is used directly in boot files

```typescript
authStore.$patch({ isInitialized: true });
```

When `authStore.initialize()` throws (a coding error or an unexpected platform API failure), the boot file catches it and directly patches `isInitialized`. This is acceptable because:

1. It's a recovery path, not normal operation
2. The alternative (catching inside `initialize()` and returning from all error paths) would make the function's error surface invisible to callers
3. `$patch` is Pinia's official API for external state updates

---

## 7. Boot system

### How Quasar boot files work

Quasar boot files are async functions that run in order before the Vue app mounts. They receive `{ app, router, store }`:

```typescript
export default defineBoot(async ({ app, router }) => {
  // app: the Vue Application instance (before mount)
  // router: the Vue Router instance
});
```

All boot files in `quasar.config.ts` run serially in the listed order. If one throws, subsequent boots do not run and Quasar shows an error screen.

### The factory pattern

`@synkos/client` exports factories rather than boot functions directly:

```typescript
// What the package exports:
export function createAuthBoot(options: AuthBootOptions): ClientBootFn;

// What the template calls:
export default defineBoot(createAuthBoot({ config: appConfig }));
```

**Why factories?**

If the package exported a ready-made boot function (`export const authBoot = defineBoot(...)`), the function would run with zero configuration — there would be no way to inject `appConfig`, `apiBaseUrl`, or hooks.

Factories allow the template to pass configuration at the call site while keeping all the complex logic (Keychain access, background state tracking, router redirect on failure) inside the package.

`ClientBootFn` is typed as `(params: { app: App; router: Router }) => Promise<void>`, which is exactly what `defineBoot()` expects. The `defineBoot` wrapper just adds Quasar's type annotation — the function itself is compatible.

### Boot order constraints

```
quasar.config.ts: boot: ['i18n', 'auth', 'notifications', 'splash']
```

| Constraint                    | Why                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `i18n` before `auth`          | `auth` boot initializes the auth store. The store's `initialize()` calls `promptBiometric()` which uses the app name. If the Face ID prompt appears before i18n is ready, the locale-dependent `appConfig.name` string works but the vue-i18n `t()` function would not be available for any component that renders during the prompt. |
| `auth` before `notifications` | Push token registration (`flushPendingToken`) needs an active session. If notifications ran first and tried to flush, `useSettingsStore()` might access `getClientConfig()` before `setClientConfig()` was called by the auth boot.                                                                                                   |
| `splash` last                 | The splash screen hides after everything is initialized. If it ran earlier, the user would see the uninitialized UI briefly.                                                                                                                                                                                                          |

### Injection points

Each factory exposes only what the user actually needs to customize:

| Factory                   | Configurable                                  | Not configurable                                           |
| ------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `createAuthBoot`          | `config`, `apiBaseUrl`, `onLogin`, `onLogout` | Keychain server, storage key derivation, 401 retry queue   |
| `createI18nBoot`          | `messages` (per locale)                       | i18n options (`legacy: false`, `fallbackLocale`)           |
| `createNotificationsBoot` | `onNotification`, `onActionPerformed`         | Permission request flow, token caching                     |
| `createSplashBoot`        | (nothing)                                     | Fade duration (comes from `appConfig.native.splashScreen`) |

Anything not in the public interface is considered an implementation detail and may change between minor versions without a breaking change notice.

---

## 8. i18n architecture

### Two-layer message system

```
@synkos/client/src/i18n/en-US.ts      ← core strings (auth, settings, nav, profile)
                                              ↓
                         createI18nBoot({ messages: { 'en-US': appEnUS } })
                                              ↓ merged at boot time
                                   { ...coreEnUS, ...appEnUS }
                                              ↓
                              createI18n({ messages: merged })
```

The merge is a shallow spread at the top-level namespace:

```typescript
messages['en-US'] = { ...coreEnUS, ...(options.messages?.['en-US'] ?? {}) };
```

**Implication:** app strings at the same top-level key override core strings. Keys at nested levels do not auto-merge — if the app provides a `pages` key, it must include all sub-keys it wants to keep from the core. In practice this is never an issue because the core's top-level keys (`nav`, `pages`, `components`, `legal`, `common`) are distinct from app-specific keys (`tabs`, `pages.home`, `pages.dashboard`).

**Why shallow merge?** Deep merging requires either a dependency (`deepmerge`) or custom recursive logic. The core and app namespaces are designed to be orthogonal — there's no case where both define `pages.home`. Shallow merge is sufficient, simpler, and has no dependencies.

### Type augmentation

`src/i18n/index.ts` in the template augments the vue-i18n module to give `t()` type safety:

```typescript
import { coreEnUS } from '@synkos/client';
import appEnUS from './en-US';

type MergedMessages = typeof coreEnUS & typeof appEnUS;

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MergedMessages {}
}
```

This gives full autocompletion and compile-time validation for `t('pages.auth.tagline')`, `t('tabs.home')`, etc. The intersection type `typeof coreEnUS & typeof appEnUS` accurately represents the merged message object.

### setLocale bridge vs direct i18n instance export

An alternative design would be to export the i18n instance from the boot file and import it in the settings store. This was rejected because:

1. Boot files are Quasar-specific — the `@synkos/client` package cannot use `defineBoot` from `#q-app/wrappers`
2. The i18n instance is created inside an async function; exporting a `let i18n` variable that gets assigned later is error-prone (if the store reads it before the boot completes, it's undefined)
3. The bridge makes the dependency explicit and testable

### Locale persistence

The settings store saves the current locale to `localStorage` under `appConfig.storageKeys.settings`:

```json
{ "appLang": "es-ES", "haptics": true, "pushNotificationsEnabled": true }
```

At boot time, `createI18nBoot` reads this key before the settings store is initialized to set the initial locale on the i18n instance. This avoids a flash-of-wrong-language on cold start.

---

## 9. Router architecture

### Guard logic

The single global `beforeEach` guard enforces three invariants:

```typescript
Router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isPublicRoute = to.name === 'auth-login';
  const canAccess = authStore.isAuthenticated || authStore.isGuest;

  // 1. Prevent authenticated+verified users from seeing the login screen
  if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
    return { name: 'home' };
  }

  // 2. Force unauthenticated users (including no-session guests) to login
  if (!isPublicRoute && !canAccess) {
    return { name: 'auth-login' };
  }

  // 3. Force email verification before app access
  if (
    !isPublicRoute &&
    authStore.isAuthenticated &&
    !authStore.isGuest &&
    !authStore.user?.isEmailVerified
  ) {
    return { name: 'auth-login', query: { verify: '1' } };
  }

  return true;
});
```

**Why dynamic import for `useAuthStore`?**

```typescript
const { useAuthStore } = await import('src/stores/auth.store');
```

Both the router and the auth store are used in boot files. If the router module imported the auth store at the top level, Vite/Node's module resolution would create a cycle during boot:

- `router/index.ts` imports `auth.store.ts`
- `boot/auth.ts` imports `auth.store.ts`
- `quasar.config.ts` imports both

The dynamic import delays resolution until `beforeEach` is actually called, at which point the boot cycle is complete and all modules are initialized.

### Why `isEmailVerified` is checked in the guard (not in components)

Email verification is a security invariant, not a UI preference. If it were only checked in components, a user with an unverified email could navigate directly to protected routes by manipulating the URL. The guard ensures it cannot be bypassed.

### coreAuthRoute vs appTabRoutes

```typescript
// index.ts — route assembly
const routes = [
  coreAuthRoute, // /auth/* — AuthLayout, no chrome
  appFullscreen, // /app/* — AuthLayout, app-specific full-screen
  {
    path: '/',
    component: MainLayout, // All children get nav bar + tab bar
    children: [
      ...appTabRoutes, // User-defined feature tabs
      coreProfileRoute, // /profile — always present
      ...coreSettingsRoutes, // /settings/* — framework-managed
    ],
  },
  { path: '/:catchAll(.*)*', component: ErrorNotFound },
];
```

**Why is `coreProfileRoute` in `core.routes.ts` rather than `app.routes.ts`?**

The profile route is included in the tab bar and cannot be accidentally removed when the user replaces `appTabRoutes`. Every app built on Synkos gets a profile tab — it's part of the framework's contract. If the user's `app.routes.ts` only defined `[home, dashboard]`, the profile tab would still appear because it's assembled separately.

### RouteMeta type augmentation

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string;
    parentTitleKey?: string;
    requiresAuth?: boolean;
  }
}
```

`MainLayout` reads `route.meta.titleKey` and resolves it with `t()`:

```typescript
const pageTitle = computed(() => {
  if (route.meta?.titleKey) return t(route.meta.titleKey);
  return appConfig.name;
});
```

Because `pageTitle` is a `computed()` that calls `t()`, it re-evaluates automatically when the locale changes. The nav bar title always reflects the current language without a page reload — no `watch` on locale needed.

---

## 10. @synkos/server internals

### ModuleDefinition contract

The unit of extensibility in `@synkos/server` is the `ModuleDefinition`:

```typescript
interface ModuleDefinition {
  path: string; // mount point (e.g. '/products')
  router: Router; // Express router with all the routes
  auth?: 'required' | 'optional' | 'none' | 'mixed';
  adminOnly?: boolean;
}
```

`createApp()` iterates over all modules (core + user-defined) and mounts them under `/api/v1`:

```typescript
for (const mod of [...coreModules, ...config.modules]) {
  const middleware = resolveAuthMiddleware(mod.auth);
  app.use(`/api/v1${mod.path}`, ...middleware, mod.router);
}
```

**Auth modes:**

| Mode         | Behavior                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `'required'` | Requires a valid JWT. Returns 401 if missing or invalid.                                                       |
| `'optional'` | Validates the JWT if present, but allows the request through if absent. Populates `req.user` if authenticated. |
| `'none'`     | No authentication check. Completely public.                                                                    |
| `'mixed'`    | The module handles its own auth per-route. The global middleware is not applied.                               |

### Adapter pattern (hexagonal architecture)

Core modules never import concrete implementations (Resend, R2, Redis). They import from port interfaces:

```typescript
// Inside a module
import { getEmailAdapter } from '@synkos/server/adapters';

const emailAdapter = getEmailAdapter();
await emailAdapter.sendEmail({ to, subject, html });
```

`getEmailAdapter()` returns whatever was registered via `setEmailAdapter()`:

```typescript
// apps/backend/src/bootstrap/adapters.ts
if (env.RESEND_API_KEY) {
  setEmailAdapter(new ResendEmailAdapter({ apiKey: env.RESEND_API_KEY, from: env.FROM_EMAIL }));
}
// If not set, getEmailAdapter() returns a NoopEmailAdapter that just console.logs
```

**Why the registry pattern instead of dependency injection?**

DI containers (tsyringe, inversify) add significant boilerplate and make TypeScript typing complex. The registry pattern achieves the same result — swappable implementations — with a much simpler API. It does assume a single adapter per type per process (no multi-tenancy), which is the right assumption for the target use case.

### Domain events

Modules emit domain events instead of calling other modules directly:

```typescript
// In auth module, after successful registration:
import { emitEvent } from '@synkos/server/events';
emitEvent('user.created', { userId: user._id.toString(), email: user.email });
```

```typescript
// In apps/backend/src/bootstrap/listeners.ts
import { onEvent } from '@synkos/server/events';
onEvent('user.created', async ({ userId, email }) => {
  await emailAdapter.sendEmail({
    to: email,
    subject: 'Welcome!',
    html: welcomeTemplate(userId),
  });
});
```

**Why events instead of direct calls?**

If the auth module called `sendWelcomeEmail()` directly, it would need to import from the email module or the user's custom code. This creates bidirectional dependencies between modules that are hard to maintain. Events invert the dependency: the auth module knows nothing about what happens after registration — it just broadcasts the fact. The user's `listeners.ts` decides what to do.

### Boot order in `createApp()`

```
extensions()          ← Mongoose schema patches (must run before DB connect)
listeners()           ← Event subscriptions
wireCoreAdapters()    ← Built-in defaults (ConsoleEmail, NoopStorage, etc.)
adapters()            ← User overrides
await connectDB()     ← MongoDB connection
await startupHooks    ← Async initialization (seed data, warm caches)
buildExpress()        ← Assemble the Express app and mount all modules
server.listen()       ← Start accepting connections
```

`extensions()` runs first because Mongoose schema modifications (adding fields, indexes) must happen before any model is instantiated. After `connectDB()`, Mongoose starts caching query results against the schema — patching it afterward leads to undefined behavior.

---

## 11. Template sync pipeline

### apps/ vs templates/ relationship

```
apps/frontend/  ──[pnpm sync:templates]──▶  templates/frontend/
    ↑                                                ↓
develop here                         [pnpm create synkos] → user's project
(workspace:* deps,                   (published npm versions,
 dev values)                          template vars)
```

The sync script (`scripts/sync-templates.mjs`) does three things:

1. **Copies `src/`** — direct file copy with zero transformation. The source and template are identical.
2. **Transforms `capacitor.config.json`** — replaces real values with template variables:
   - `'com.synkos.dev'` → `'{{BUNDLE_ID}}'`
   - `'Synkos Dev'` → `'{{APP_NAME}}'`
3. **Processes `package.json` dependencies** — applies three rules:
   - Third-party deps (non-`workspace:*`) → copied as-is (`"axios": "^1.14.0"`)
   - First-party published packages (in `FIRST_PARTY_PACKAGES`) → converted to `"^{version}"` (read from the package's own `package.json`)
   - Internal-only workspace packages (not in `FIRST_PARTY_PACKAGES`) → excluded from the template

### FIRST_PARTY_PACKAGES

```javascript
const FIRST_PARTY_PACKAGES = {
  synkos: path.join(ROOT, 'packages', 'synkos', 'package.json'),
  '@synkos/ui': path.join(ROOT, 'packages', 'synkos-ui', 'package.json'),
  '@synkos/client': path.join(ROOT, 'packages', 'synkos-client', 'package.json'),
};
```

When a new package is created and meant to be consumed by the template, it must be added here. Otherwise, the `workspace:*` dependency in `apps/frontend/package.json` will be silently excluded from the generated template.

### Template variable substitution

`create-synkos` reads the scaffolded template files and replaces `{{VAR}}` placeholders at project generation time:

| Variable           | Replacement                                        |
| ------------------ | -------------------------------------------------- |
| `{{PROJECT_NAME}}` | The CLI-prompted project name (e.g. `myapp`)       |
| `{{APP_NAME}}`     | The human-readable name (e.g. `My App`)            |
| `{{BUNDLE_ID}}`    | The bundle identifier (e.g. `com.mycompany.myapp`) |

These placeholders appear in `app.config.ts`, `capacitor.config.json`, and `package.json`. The substitution runs on every file in the template before writing to the user's directory.

---

## 12. Security model

### Access token: in-memory only

The access token (`ref<string | null>`) lives in the Pinia store and is never serialized to disk. It is lost on app close and must be re-obtained from the refresh flow on the next launch.

**Why this is correct:** Access tokens are short-lived (15 minutes). Their value is in-flight request authorization, not persistence. Storing them in localStorage or Keychain provides no benefit (the session would be restored via the refresh token anyway) and increases the attack surface.

### Refresh token: iOS Keychain

The refresh token is stored via `NativeBiometric.setCredentials()` which writes to the iOS Keychain. On web and development builds, `NativeBiometric` is not available — in these cases the try/catch in `saveRefreshToken()` falls back to a no-op, which means the session cannot be restored after a page reload. This is acceptable for development; production is always native.

**Keychain vs `@capacitor/preferences`:** Earlier documentation showed the refresh token stored in `@capacitor/preferences`. The current implementation uses `@capgo/capacitor-native-biometric`'s credential storage, which maps to the iOS Keychain. The Keychain is encrypted at rest by the Secure Enclave, inaccessible to other apps, and—crucially—the biometric plugin can gate its access behind a Face ID check when `biometricEnabled` is true.

### Biometric authentication model

When `biometricEnabled` is true, `initialize()` calls `promptBiometric()` before restoring the session from the Keychain. The biometric check and the Keychain access are separate:

1. `NativeBiometric.verifyIdentity()` — authenticates the user's identity
2. `NativeBiometric.getCredentials()` — reads the refresh token from the Keychain

If biometric authentication fails (wrong fingerprint, Face ID not recognized), the Keychain is never accessed. If the user cancels, the app redirects to the login screen without revealing any session state.

**What biometrics protect:** The refresh token. Without biometrics, anyone with physical access to an unlocked device can cold-start the app and be automatically logged in. With biometrics enabled, the session restoration is gated behind the user's biometric.

**What biometrics do NOT protect:** In-memory state after the app is already running. Once the session is restored, the access token is in the Pinia store. Biometrics are only re-checked on cold start or after the grace period.

### Token rotation prevents theft propagation

See §4 (Auth lifecycle) for the token rotation mechanism. The key security property: **a stolen refresh token is detected on the next legitimate use** because the server invalidates the old token when issuing the new one. The detection window equals the refresh interval (access token TTL = 15 minutes in the default configuration).

### OAuth: server-side token verification

For Google and Apple sign-in, the client sends the `idToken` (a JWT issued by Google/Apple) to the server. The server verifies it:

1. **Google:** Fetches Google's public keys and verifies the JWT signature, audience, and expiry
2. **Apple:** Fetches Apple's public keys from `appleid.apple.com/auth/keys`, verifies the nonce (generated per-request by the client), audience, and expiry

The client does not interpret the OAuth JWT — it's treated as an opaque credential. This prevents a class of attacks where a client-side JWT validation error or a compromised library would allow a forged token to gain access.

---

## 13. Versioning and the semver contract

### What constitutes a breaking change

| Change type                                     | Semver bump | Example                                                      |
| ----------------------------------------------- | ----------- | ------------------------------------------------------------ |
| Remove or rename a public export                | major       | Removing `useSignOut` from `@synkos/client`                  |
| Change a function's required parameters         | major       | Adding a required `options` parameter to `createAuthBoot`    |
| Change observable behavior that code depends on | major       | Changing storage key format (invalidates persisted sessions) |
| Add optional parameter to existing function     | minor       | Adding `onTokenRefresh` to `AuthBootOptions`                 |
| Add new export to a package                     | minor       | Adding `useNetworkStatus` composable                         |
| Bug fix with no API change                      | patch       | Fix race condition in 401 retry queue                        |
| Performance improvement                         | patch       | Replace `window.__pinia` with token provider (already done)  |
| New feature behind a flag                       | minor       | New `features.offlineMode` flag in `AppConfig`               |

### What the template upgrade path looks like

When `@synkos/client` releases a new version:

```bash
# In the user's project
pnpm update @synkos/client
```

If the bump is patch or minor, no changes to the user's code are needed — `createAuthBoot()`, `createI18nBoot()`, the stores, and services are all backwards-compatible. The user gets the fix or new feature transparently.

If the bump is major, a migration guide is published alongside the release. Breaking changes in `@synkos/client` are rare because the public API is small (4 factories, 2 stores, a handful of services and composables).

### Changeset workflow

All packages in the monorepo use [Changesets](https://github.com/changesets/changesets) for versioning:

```bash
# After making a change to a package:
pnpm changeset

# Follow the prompts:
# 1. Select which package(s) changed
# 2. Select the bump type (patch / minor / major)
# 3. Write a short summary of the change

# This creates a .changeset/*.md file — commit it alongside your code changes
```

When the `feat/synkos-client-package` branch is merged and the release workflow runs:

```bash
pnpm release  # runs: pnpm build && changeset publish
```

Changesets automatically:

1. Bumps version numbers in `package.json` for all changed packages
2. Updates `CHANGELOG.md` for each package
3. Publishes to npm

### Packages that don't need changesets

Changes that only affect `apps/` or `templates/` do not need a changeset:

- New features in `apps/frontend/src/features/` — these are app-specific, not framework
- Changes to `templates/frontend/` that only affect new projects — existing users have their own copy

Changes to `templates/frontend/` that reflect a framework improvement (e.g. a new `app.config.ts` field) do need a `create-synkos` patch changeset, since that's the package that ships the template to new users.
