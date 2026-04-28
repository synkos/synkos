# @synkos/ui

## 0.4.0

### Minor Changes

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

### Patch Changes

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

## 0.3.1

### Patch Changes

- 0465cc2: add Vue runtime to @synkos/client: createSynkosRouter, createSynkosBoot, SynkosApp, auth/settings pages, layouts, composables, and SynkosMessages type; template reduced from 60+ files to 16

## 0.3.0

### Minor Changes

- 1c3e656: add AppButton component with primary, ghost, and link variants

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
