# @synkos/client

## 0.5.2

### Patch Changes

- 49a6a4b: Two fixes that close the "scaffold a Synkos app and `pnpm dev:ios` crashes / requires manual native config" gap.

  **`@synkos/client` — promote `@capgo/*` plugins to dependencies.** `auth/store.ts` dynamic-imports `@capgo/capacitor-native-biometric` (biometric login) and `@capgo/capacitor-social-login` (Apple / Google sign-in). Both were left as "the consuming app installs them" — same gap we fixed for the `@capacitor/*` plugins last release. Apps that didn't install them got runtime errors the first time the auth flow tried to use Face ID or Sign in with Apple. Now they ship as direct deps of `@synkos/client`, so `pnpm install` brings everything the framework's auth flow needs.

  **`create-synkos` — sane iOS template defaults.** The template's `Info.plist` was carrying `Grading Center` leftovers (the project this monorepo originally evolved from): hardcoded display name, a real Google client ID + URL scheme, and four usage descriptions for plugins Synkos doesn't bundle (camera, location, microphone, photo library). Worse, the template was missing the only key Synkos _does_ need: `NSFaceIDUsageDescription` — so apps scaffolded via `pnpm create synkos` crashed with `attempted to access privacy-sensitive data without a usage description` the first time the user tried to sign in with Face ID.

  Cleaned the template `Info.plist`:
  - Removed contaminated keys (Google client ID, URL types, camera/location/microphone/photo descriptions).
  - Replaced `Grading Center` with `{{APP_NAME}}` substitution so the user's chosen app name appears in the iOS bundle and in the Face ID prompt.
  - Added `NSFaceIDUsageDescription` referencing `{{APP_NAME}}`.
  - Replaced hardcoded `com.template.myapp` bundle ID in `project.pbxproj` with `{{BUNDLE_ID}}` so each scaffolded app gets its own.

  Wired `Info.plist` and `project.pbxproj` into `create-synkos`'s `VARS_IN_CONTENT` allowlist so the substitutions actually fire at scaffold time. Documented in `sync-templates.mjs` that the iOS folder is hand-maintained in `templates/` (never auto-synced from `apps/frontend`) so dev-workspace contamination can't leak into shipped templates again.

  Apps scaffolded with `pnpm create synkos` now boot on iOS sim out of the box, with a Face ID prompt that shows the user's actual app name and no `attempted to access privacy-sensitive data` crash.

## 0.5.1

### Patch Changes

- Updated dependencies [a022d15]
  - synkos@0.3.1

## 0.5.0

### Minor Changes

- 7a3f159: Native iOS fidelity for `MainLayout` — fixes the "first tab change is jumpy" symptom and adds the UITabBar / UINavigationController behaviours that were missing.

  **Bug fixes (no API change):**
  - Tab transition direction is now decided by a `router.afterEach` guard comparing tab indices of `from` vs `to`. Every navigation source — tab tap, deep link, programmatic push, browser back — gets the right direction. The previous click-handler logic with a `setTimeout(350)` revert had a race condition under quick taps and ignored non-tap navigation.
  - Permanent GPU layer promotion on the nav bar, tab bar and the page root. The first tab change no longer pays a one-frame layer-allocation cost from `backdrop-filter` and `will-change: transform` being toggled at animation start.
  - `prefers-reduced-motion` collapses transitions to 0.01ms and disables the GPU layer hint.

  **New behaviours, additive:**
  - Per-page scroll. Each `AppPage` now owns its own scroll container so a tab cached via `<keep-alive>` keeps its scroll position across navigations — the iOS UITabBarController model. Previously the scroll lived on `.slide-wrapper` inside `MainLayout`, which leaked positions across tabs.
  - Re-tap on the active tab → scroll to top (UITabBar gesture). Re-tap while inside a sub-route → pop to the tab root.
  - Scroll-edge appearance. Nav bar is transparent at the top of the active page, glass once content scrolls. Matches `UINavigationBarAppearance.scrollEdgeAppearance`.
  - Dedicated `nav-push-forward` / `nav-push-back` transitions for sub-route navigation, with the iOS `cubic-bezier(0.32, 0.72, 0, 1)` curve. Tab-to-tab still uses `tab-slide-*`; cold-mount and non-tab paths use `tab-fade`.
  - iOS edge-swipe-back gesture via the new `useEdgeSwipeBack()` composable. Wired up by `MainLayout` on `.slide-wrapper` and gated to sub-routes only.
  - Tab bar slides off-screen when the on-screen keyboard appears (`@capacitor/keyboard`).
  - StatusBar style follows the active theme (`@capacitor/status-bar`) — system icons stay legible after a theme switch.
  - `useHaptic()` composable centralises the haptic vocabulary (`tab-switch`, `select`, `success`, `error`, …) and honours the user's `settings.haptics` preference.

  **New options on `setupSynkosRouter` / `createSynkosRouter`:**
  - `tabTransition: 'push' | 'fade' | 'none'` — default `'push'` keeps current behaviour. `'fade'` matches Apple's own apps; `'none'` is the most native iOS feel (UITabBarController itself does not animate tab swaps).
  - `stackNavigation: boolean` — default `false`. Enables the full iOS `UITabBarController` model: each tab gets its own navigation stack tracked in memory. Forward navigation appends, re-entry to a previously-visited path truncates, switching back to a previously-visited tab restores the top of its stack, and `MainLayout.goBack()` / the edge-swipe-back gesture pop the active tab's stack (using `router.replace()`) instead of hitting Vue Router's global history. A new `useTabStack()` composable exposes the active tab's stack reactively (`stack`, `canPop`, `depth`, `pop()`) for stack-aware UI.

  **New slots on `MainLayout`:**
  - `header-left`, `header-center`, `header-right`, `tab-bar`. Each ships with the existing rendering as the default. Scoped slot props expose the values needed to replicate or extend behaviour without re-reading state.

  **Capacitor plugins are now framework dependencies.** Synkos uses Capacitor plugins internally — `@capacitor/haptics` is fired statically across the app, `@capacitor/preferences` is imported by the auth store, `@capacitor/keyboard` and `@capacitor/status-bar` drive the new keyboard / theme behaviours. They were previously expected to be installed by the consuming app, which made it easy to forget one and hit a runtime error or a missing feature. They're now declared as `dependencies` of `@synkos/client`, so `pnpm install @synkos/client` brings everything Synkos needs:
  - `@capacitor/app`
  - `@capacitor/haptics`
  - `@capacitor/keyboard`
  - `@capacitor/preferences`
  - `@capacitor/push-notifications`
  - `@capacitor/splash-screen`
  - `@capacitor/status-bar`

  `@capacitor/core` stays as a peer dependency — the native bridge is per-app and the consumer must own its version.

  **Migration:** apps can drop these from their own `package.json` if they don't import them directly; pnpm will dedupe automatically. Apps that import Capacitor plugins themselves (e.g. `import { Haptics } from '@capacitor/haptics'`) should keep them as direct dependencies for clarity.

### Patch Changes

- Updated dependencies [7a3f159]
- Updated dependencies [7a3f159]
  - @synkos/ui@0.6.0
  - synkos@0.3.0

## 0.4.0

### Minor Changes

- 47ba21d: Eliminate the rehydration race that breaks OAuth callbacks:
  - `useAuthStore().whenReady()` returns a promise that resolves the first time
    `initialize()` settles (success or recoverable failure).
  - The API client awaits hydration before each request via the new
    `awaitAuthReady` hook (registered automatically by the auth store), so a
    request fired from `onMounted` of a callback page picks up the rehydrated
    bearer token instead of going out anonymous and 401-ing. A 5-second hard
    timeout prevents a stuck rehydration from blocking the API client.

  User-owned callback pages no longer need their own `waitForAuth(...)` polling
  loop — `getApiClient()` is now safe to call directly from `onMounted`.

- 58c3ec6: Add `getPostAuthRoute` / `setPostAuthRoute` for post-login navigation.

  Built-in fallback pages (`LoginPage`, `UsernamePickerPage`, `DeleteAccountPage`,
  `ErrorNotFound`) and both router factories (`createSynkosRouter`,
  `setupSynkosRouter`) now route through a single helper instead of hardcoding
  `router.replace({ name: 'home' })`. The default target is the first user-declared
  tab route (or `homeRouteName` in `setupSynkosRouter`), falling back to `'home'`.

  This unblocks renaming the root route — apps no longer need to keep `name: 'home'`
  on their landing route to avoid `No match for {"name":"home"}` after login.

  User-owned auth pages can adopt the same helper:

  ```ts
  import { getPostAuthRoute } from '@synkos/client';
  await router.replace(getPostAuthRoute());
  ```

  Use `setPostAuthRoute(...)` to override conditionally (e.g. a one-time onboarding
  route on first login).

### Patch Changes

- 58c3ec6: `setupSynkosRouter` auth guard now respects explicit `meta.requiresAuth: true`.

  Routes under `/auth/*` are still treated as public by default (back-compat), but a
  route that explicitly declares `meta: { requiresAuth: true }` is now correctly
  treated as protected even if its path lives under `/auth/*`. This unblocks OAuth
  callback routes mounted under `/auth/<provider>/callback`, which previously got
  silently rewritten to the home route by the guard before the callback page could run.

  No change for apps that did not declare `meta.requiresAuth` — the path heuristic is
  preserved as the fallback.

- Updated dependencies [1cf8102]
  - @synkos/ui@0.5.0

## 0.3.0

### Minor Changes

- 79fd1a5: Framework v2 — gaps completados + reorganización interna src/auth/ y src/navigation/

  **@synkos/client — correcciones funcionales**
  - `SynkosApp.vue`: transiciones de auth ahora detectan por path `/auth` en lugar del nombre de ruta hardcodeado `'auth-login'` — compatible con `authRoutes` personalizado
  - Boot: respeta `config.features.pushNotifications === false` para saltarse la inicialización de notificaciones
  - Auth store: respeta `config.features.faceId === false` para saltarse la promesa biométrica aunque el usuario la tuviera activada
  - `useNavTitle(title)` — nuevo composable que inyecta un título dinámico en el nav bar desde cualquier página; tiene prioridad sobre `route.meta.titleKey`; limpia automáticamente en `onUnmounted`

  **@synkos/client — plataforma**
  - Platform tokens en `platform.scss` con variables CSS para nav-bar-height, tab-bar-height y curvas de animación por plataforma (`[data-platform="ios"]` / `[data-platform="android"]`)
  - MainLayout usa `var(--nav-content-size)`, `var(--tab-bar-height)` y `var(--platform-transition-push)` en lugar de valores hardcodeados iOS

  **@synkos/client — reorganización interna (no breaking)**
  - `src/auth/` — auth store, auth/account/user/username services, auth boot
  - `src/navigation/` — router factory, layouts, nav composables (useNavAction, useNavTitle), nav internals (tab-config, nav-state, settings-config)
  - Todos los exports públicos en `index.ts` se mantienen idénticos — zero breaking changes para consumers

  **create-synkos**
  - Template incluye `src/css/platform.scss` con tokens iOS/Android listos para personalizar

- 79fd1a5: Framework v2: headless auth, N-tab system, nav actions, settings opt-in, platform composable

  **@synkos/client**
  - `authRoutes` in `createSynkosRouter` — override login/username pages with your own components; package defaults remain for backwards compat
  - `settingsConfig` in `createSynkosRouter` — opt-in to specific settings sections (`account`, `preferences`, `notifications`, `security`, `billing`, `support`, `legal`, `about`) and add custom sections
  - MainLayout now reads `getTabConfig()` — supports N tabs (not hardcoded to 2), reactive badge counts via `AppTabRoute.badge`, keep-alive via `AppTabRoute.cache`
  - `hideTabBar` route meta — hide the tab bar on specific routes
  - `useNavAction({ icon, onClick })` — inject a trailing action into the nav bar from any page; cleans up automatically on unmount
  - `usePlatform()` — returns `{ isIOS, isAndroid, isNative, isWeb, platform }`; boot now applies `data-platform` to `<html>`
  - `LegalBottomSheet` and `getClientConfig` exported from public API (needed by user-owned auth pages)
  - New types exported: `AuthRoutesConfig`, `SettingsConfig`, `SettingsCustomSection`, `BuiltInSettingsSection`

  **@synkos/ui**
  - `useBottomSheet(initialOpen?)` — headless composable: `{ isOpen, open, close, toggle, bindings }`
  - `useDrawer(initialOpen?)` — headless composable: same API as `useBottomSheet`

  **create-synkos**
  - Template now includes editable auth pages at `src/pages/auth/LoginPage.vue` and `src/pages/auth/UsernamePage.vue`
  - All auth page colors use CSS custom properties (`--auth-bg`, `--auth-text-primary`, `--color-primary`, etc.) — fully themeable without touching any package
  - Auth tokens added to `src/css/dark.theme.scss` and `src/css/light.theme.scss`
  - Router uses `authRoutes` to wire the template's own auth pages

- 79fd1a5: Framework v2 — Quasar-style layout routing

  **Nuevo: patrón de rutas con layouts explícitos**

  El usuario define la estructura de rutas completa igual que en Quasar/Vue Router puro. Los layouts son componentes que se usan en las rutas directamente:

  ```ts
  import { MainLayout, AuthLayout, setupSynkosRouter, synkosSettingsRoutes } from '@synkos/client'

  const router = createRouter({
    routes: [
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          { path: 'login', name: 'auth-login', meta: { requiresAuth: false }, component: LoginPage },
        ],
      },
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '',
            name: 'home',
            meta: { tab: { icon: 'home', labelKey: 'tabs.home', cache: true, componentName: 'HomePage' } },
            component: HomePage,
          },
          ...synkosSettingsRoutes(),          // profile + settings
        ],
      },
      {
        path: '/onboarding',
        component: OnboardingLayout,         // tu propio layout
        children: [...]
      },
    ],
  })

  setupSynkosRouter(router)                  // guards + tab discovery + drawer config

  router.beforeEach((to) => { /* tus guards */ })
  ```

  **Nuevas exports:**
  - `MainLayout` — componente de layout principal (nav bar + tab bar)
  - `AuthLayout` — componente de layout de auth
  - `setupSynkosRouter(router, options?)` — wires guards, descubre tabs desde `meta.tab`, configura drawer
  - `synkosSettingsRoutes(config?)` — devuelve las rutas de profile + settings listas para hacer spread
  - `TabMeta` — tipo para `route.meta.tab`
  - `SynkosSetupOptions` — opciones de `setupSynkosRouter`

  **`meta.tab` — declarar tabs inline en la ruta:**

  ```ts
  meta: {
    tab: {
      icon: 'home',
      labelKey: 'tabs.home',
      cache: true,
      componentName: 'HomePage',   // nombre del componente Vue para keep-alive
      badge: unreadCountRef,       // Ref<number> reactivo
    }
  }
  ```

  **`meta.requiresAuth: false`** — marca rutas públicas para el guard de `setupSynkosRouter`.

  **`AppTabRoute`**: `component` ahora es opcional (nunca fue usado por MainLayout para renderizar).
  **`AppTabRoute`**: nuevo campo `componentName?: string` para keep-alive explícito.

  `createSynkosRouter` sigue funcionando sin cambios — ambas APIs son compatibles.

- 79fd1a5: Framework v2 — settings y profile pages movidas al template (headless completo)

  Todas las páginas de settings y profile ahora viven en el proyecto del developer, igual que las páginas de auth. El paquete provee stores, servicios y componentes — no páginas.

  **Nuevo en el template:**

  ```
  src/pages/settings/
  ├── ProfilePage.vue
  ├── components/ProfileHeader.vue
  ├── about/  AboutHubPage.vue + AboutPage.vue
  ├── account/ AccountHubPage.vue + EditProfilePage.vue + ChangePasswordPage.vue
  │            ChangeUsernamePage.vue + DeleteAccountPage.vue
  │            components/SignOutDialog.vue
  ├── billing/  BillingHubPage.vue          ← integra Stripe, RevenueCat, etc.
  ├── legal/    LegalHubPage.vue            ← tus propios términos
  ├── notifications/ NotificationsHubPage.vue
  ├── preferences/  PreferencesHubPage.vue + LanguagePage.vue
  ├── security/ SecurityHubPage.vue
  └── support/  SupportHubPage.vue + HelpPage.vue

  src/router/settings.routes.ts   ← todas las rutas definidas, editables
  ```

  Todas las páginas importan del API público de `@synkos/client` (`useAuthStore`, `useSettingsStore`, `useSettings`, `useSignOut`, `getClientConfig`, `LegalBottomSheet`, etc.).

  **`router/index.ts`** usa `...settingsRoutes` del archivo local en lugar de `...synkosSettingsRoutes()`.

  **Nuevo export en `@synkos/client`:** `useSettings` — composable que encapsula `useSettingsStore` + push notification state + `appLangs` computed.

  `synkosSettingsRoutes()` sigue disponible en el paquete para usuarios que usan `createSynkosRouter` o prefieren las páginas por defecto sin personalizar.

### Patch Changes

- 79fd1a5: Framework v2 — large title colapsable + limpieza post-reorg

  **@synkos/ui**
  - `AppPageLargeTitle` ahora colapsa el título en el nav bar al hacer scroll — usa `IntersectionObserver` + `inject('synkos:set-nav-title')` inyectado por `MainLayout`. El nav bar hace crossfade entre el título de ruta y el título colapsado. Se limpia automáticamente en `onUnmounted`. Funciona con títulos dinámicos (actualiza si cambia el prop `title` mientras está colapsado).

  **@synkos/client**
  - `MainLayout` hace `provide('synkos:set-nav-title')` para el canal de comunicación con `AppPageLargeTitle`
  - Nav bar title con transición `nav-title-fade` (crossfade posicionado absolutamente) para la animación de colapso
  - `boot/index.ts` corregido — apuntaba a `./auth.js` eliminado tras la reorg, ahora `../auth/boot.js`
  - `stores/index.ts` corregido — `./auth.store.js` → `../auth/store.js`
  - `src/vue/layouts/` (vacío) eliminado
  - Paths de tipos corregidos en `navigation/internal/tab-config.ts` y `navigation/router.ts`

- c1bc76c: remove unused Quasar framework declarations and fix router.ts type error
- Updated dependencies [79fd1a5]
- Updated dependencies [79fd1a5]
- Updated dependencies [79fd1a5]
  - @synkos/ui@0.4.0

## 0.2.0

### Minor Changes

- 0465cc2: add Vue runtime to @synkos/client: createSynkosRouter, createSynkosBoot, SynkosApp, auth/settings pages, layouts, composables, and SynkosMessages type; template reduced from 60+ files to 16

### Patch Changes

- Updated dependencies [0465cc2]
  - @synkos/ui@0.3.1
