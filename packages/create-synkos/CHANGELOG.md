# create-synkos

## 0.2.13

### Patch Changes

- aac73bc: exclude .github, .claude, and docs from generated template; update README with template variables
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

- c1bc76c: remove unused Quasar framework declarations and fix router.ts type error

## 0.2.12

### Patch Changes

- afe9089: fix quasar.config.ts in template (boot array, remove obsolete plugins); sync script now covers root config files

## 0.2.11

### Patch Changes

- 4e0d720: fix template package.json to reference @synkos/client@^0.2.0 and @synkos/ui@^0.3.1

## 0.2.10

### Patch Changes

- 0465cc2: add Vue runtime to @synkos/client: createSynkosRouter, createSynkosBoot, SynkosApp, auth/settings pages, layouts, composables, and SynkosMessages type; template reduced from 60+ files to 16

## 0.2.9

### Patch Changes

- d26569b: add @synkos/ui to frontend template as default UI library

## 0.2.8

### Patch Changes

- 5f58a33: pin synkos to ^0.2.0 in frontend template to ensure CLI binary is available

## 0.2.7

### Patch Changes

- 4a8fc66: update frontend template: use synkos dev ios instead of bundled dev-ios script

## 0.2.6

### Patch Changes

- 981c9a2: fix dev:ios opening App.xcodeproj instead of App.xcworkspace in Xcode

## 0.2.5

### Patch Changes

- 994b2d2: fix .npmrc not copied to generated project — npm excludes dotfiles starting with . when publishing, so .npmrc was renamed to npmrc during build and restored by scaffold

## 0.2.4

### Patch Changes

- 46ca730: add missing @capacitor/core dependency to frontend template
- 827371c: fix dev errors when running pnpm dev in a generated frontend project

## 0.2.3

### Patch Changes

- 41daa54: fix: update @synkos/server dependency in backend template to ^0.2.0

## 0.2.2

### Patch Changes

- dfd4636: fix: strip .git dirs and un-dot dotfiles when bundling templates so npm pack includes all template files

## 0.2.1

### Patch Changes

- 8d655c5: fix: include templates directory in published npm package

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
