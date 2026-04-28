# Synkos — Project Context for Claude

## What is this project?

Synkos is a **framework and scaffolding CLI** for building fullstack mobile/web apps with Vue + Capacitor (frontend) and Node/Express (backend). The main deliverable is the `create-synkos` npm package: users run `pnpm create synkos` and get a ready-to-use project.

---

## Monorepo structure

```
synkos/
├── apps/
│   ├── frontend/       ← dev workspace for the frontend template (live, workspace deps)
│   └── backend/        ← dev workspace for the backend template (live, workspace deps)
├── packages/
│   ├── create-synkos/  ← the CLI published to npm (pnpm create synkos)
│   ├── synkos/         ← core runtime package (AppConfig type, Vue plugin, guards)
│   ├── synkos-client/  ← client runtime (auth, API, stores, i18n, boot, layouts)
│   ├── synkos-ui/      ← UI component library
│   ├── synkos-server/  ← server utilities
│   ├── synkos-config/  ← shared config
│   └── synkos-utils/   ← shared utilities
├── templates/
│   ├── frontend/       ← source of truth for the frontend template (has {{VARS}})
│   └── backend/        ← source of truth for the backend template (has {{VARS}})
├── scripts/
│   └── sync-templates.mjs  ← syncs apps/ → templates/ (see below)
└── .changeset/         ← changesets for versioning packages/
```

---

## apps/ vs templates/ — the most important relationship

`apps/frontend` and `apps/backend` are **development workspaces**: they consume monorepo packages via `workspace:*`, use real package names, and are where new features are developed and tested with live reloading.

`templates/frontend` and `templates/backend` are **what the user receives** when they run `pnpm create synkos`. They contain template variables (`{{PROJECT_NAME}}`, `{{APP_NAME}}`, `{{BUNDLE_ID}}`) instead of real values, and no `workspace:*` deps.

`packages/create-synkos/templates/` is **generated at build time** (gitignored) by copying from `templates/` via `scripts/copy-templates.mjs` during the `prebuild` step.

```
apps/frontend  ──(pnpm sync:templates)──▶  templates/frontend  ──(prebuild)──▶  create-synkos npm package
     ↑                                                                                      ↓
  develop here                                                               pnpm create synkos (user)
```

### Template variables

| Variable           | Real value (apps/)     |
| ------------------ | ---------------------- |
| `{{PROJECT_NAME}}` | `frontend` / `backend` |
| `{{APP_NAME}}`     | `Synkos Dev`           |
| `{{BUNDLE_ID}}`    | `com.synkos.dev`       |

---

## @synkos/client internal structure

The package follows a **headless** pattern: logic in the package, UI pages owned by the developer.

```
packages/synkos-client/src/
├── auth/                     ← auth domain
│   ├── store.ts              ← useAuthStore (Pinia)
│   ├── boot.ts               ← createAuthBoot (individual boot factory)
│   └── services/             ← AuthService, UserService, AccountService, UsernameService
├── navigation/               ← navigation domain
│   ├── router.ts             ← createSynkosRouter + setupSynkosRouter + synkosSettingsRoutes
│   ├── layouts/              ← MainLayout.vue + AuthLayout.vue (exported as components)
│   ├── composables/          ← useNavAction, useNavTitle
│   └── internal/             ← nav-state, tab-config, settings-config (singletons)
├── boot/                     ← unified boot (synkos.ts) + individual (i18n, notifications, splash)
├── composables/              ← usePlatform, useSignOut, usePullToRefresh, useTheme
├── stores/                   ← useSettingsStore
├── services/                 ← notificationsService
├── api/                      ← axios client with token injection + 401 retry
├── internal/                 ← app-config singleton, i18n-bridge
├── i18n/                     ← en-US + es-ES core strings
├── vue/                      ← Vue components (SynkosApp, LegalBottomSheet, settings/profile pages)
│   ├── SynkosApp.vue         ← root component (re-exported)
│   ├── components/           ← AppMenuDrawer, DeletionBanner, SplashOverlay, LegalBottomSheet
│   ├── composables/          ← useSettings (composite composable)
│   └── pages/                ← settings + profile pages (built-in fallbacks)
└── index.ts                  ← public API
```

**Key rule:** `packages/synkos-client/src/vue/pages/` are the **built-in fallback pages** used by `createSynkosRouter`. The **template's** pages in `apps/frontend/src/pages/` are the **user-owned versions** that replace them via `authRoutes` / `settingsRoutes` in the router config.

---

## Template structure (what the user receives)

```
src/
├── app.config.ts              ← identity, feature flags, links, native settings
├── boot/synkos.ts             ← createSynkosBoot({ config, messages })
├── features/home/pages/       ← user's own feature pages
├── pages/
│   ├── auth/
│   │   ├── LoginPage.vue      ← EDITABLE: full auth flow (social, email, OTP, Face ID)
│   │   └── UsernamePage.vue   ← EDITABLE: first-time username picker
│   └── settings/              ← EDITABLE: all settings + profile pages
│       ├── ProfilePage.vue
│       ├── account/           ← AccountHub, EditProfile, ChangePassword, ChangeUsername, DeleteAccount
│       ├── preferences/       ← PreferencesHub, Language
│       ├── notifications/     ← NotificationsHub
│       ├── security/          ← SecurityHub
│       ├── billing/           ← BillingHub (integrate your payment provider here)
│       ├── support/           ← SupportHub, Help
│       ├── legal/             ← LegalHub (put your real terms/privacy here)
│       └── about/             ← AboutHub, About
├── layouts/
│   └── OnboardingLayout.vue   ← example custom layout (no tab bar, custom header)
├── router/
│   ├── index.ts               ← createRouter + setupSynkosRouter + custom guards
│   └── settings.routes.ts     ← explicit route definitions for all settings pages
├── css/
│   ├── app.scss               ← imports themes + platform tokens, global animations
│   ├── quasar.variables.scss  ← SCSS design tokens (colors, spacing, typography)
│   ├── dark.theme.scss        ← CSS custom properties — dark theme (default)
│   ├── light.theme.scss       ← CSS custom properties — light theme
│   └── platform.scss          ← platform tokens (--nav-bar-height, transitions iOS/Android)
└── pages/ErrorNotFound.vue
```

---

## Routing architecture (Quasar-style)

The user defines the full route tree. The framework provides layout components and a setup function:

```ts
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client'
import { settingsRoutes } from './settings.routes'

export default defineRouter(() => {
  const router = createRouter({
    routes: [
      {
        path: '/auth',
        component: AuthLayout,   // ← exported from @synkos/client
        children: [
          { path: 'login', name: 'auth-login', meta: { requiresAuth: false },
            component: () => import('src/pages/auth/LoginPage.vue') },
        ],
      },
      {
        path: '/',
        component: MainLayout,   // ← exported from @synkos/client
        children: [
          {
            path: '',
            name: 'home',
            meta: { tab: { icon: 'home', labelKey: 'tabs.home', cache: true, componentName: 'HomePage' } },
            component: () => import('src/features/home/pages/HomePage.vue'),
          },
          ...settingsRoutes,     // ← defined in src/router/settings.routes.ts
        ],
      },
      // Add your own layouts here:
      { path: '/onboarding', component: () => import('src/layouts/OnboardingLayout.vue'), children: [...] },
    ],
  })

  setupSynkosRouter(router)           // ← registers tabs + auth guard
  router.beforeEach((to) => { ... })  // ← your own guards run after Synkos's
  return router
})
```

**Tabs are declared inline on routes** via `meta.tab`. `setupSynkosRouter` auto-discovers them from `router.getRoutes()`.

**Alternative API** (simpler, less flexible): `createSynkosRouter({ config, appTabRoutes, authRoutes, settingsConfig })` still works for backwards compat.

---

## Public API summary (@synkos/client)

### Router

- `createSynkosRouter(options)` — all-in-one factory (backwards compat)
- `setupSynkosRouter(router, options?)` — Quasar-style: wire guards + tab discovery on existing router
- `synkosSettingsRoutes(config?)` — returns profile + settings `RouteRecordRaw[]` to spread into children
- `MainLayout` / `AuthLayout` — Vue components for route definitions

### Composables

- `usePlatform()` → `{ isIOS, isAndroid, isNative, isWeb, platform }`
- `useNavAction({ icon, onClick })` — inject trailing nav bar action (clears on unmount)
- `useNavTitle(title)` — inject dynamic nav bar title (clears on unmount)
- `useSignOut()` — sign-out flow with farewell animation
- `usePullToRefresh(fn)` — iOS pull-to-refresh gesture
- `useSettings()` — composite: settingsStore + push state + appLangs
- `useTheme()` — applyTheme(), system preference listener

### Stores

- `useAuthStore()` — full auth lifecycle (session, biometric, social login, account actions)
- `useSettingsStore()` — appLang, haptics, theme, pushNotificationsEnabled

### Services

- `AuthService`, `UserService`, `AccountService`, `UsernameService`, `notificationsService`

### Config

- `getClientConfig()` — read AppConfig in user-owned pages (auth, settings)

### Exported components

- `SynkosApp` — root component (wraps router-view + splash + theme)
- `LegalBottomSheet` — terms/privacy bottom sheet

---

## @synkos/ui public API

### Components

`AppButton`, `AppListRow`, `AppListSection`, `AppListDivider`, `AppIcon`, `AppPage`, `AppPageLargeTitle`, `AppBottomSheet`, `AppDrawer`, `AppSpinner`, `AppCircularProgress`, `AppEmptyState`, `SegmentControl`

### Composables

- `useBottomSheet(initialOpen?)` → `{ isOpen, open, close, toggle, bindings }`
- `useDrawer(initialOpen?)` → same API as useBottomSheet
- `useSheetDrag()` — physics-based drag for custom bottom sheets

### AppPageLargeTitle

Collapses into the nav bar on scroll (iOS large title pattern). Uses `IntersectionObserver` + `provide/inject('synkos:set-nav-title')` from MainLayout. No setup needed.

```vue
<AppPageLargeTitle title="Dashboard" subtitle="Overview" />
```

---

## Theme system

Three layers:

1. **SCSS variables** (`quasar.variables.scss`) — design tokens available in every SFC `<style lang="scss">`
2. **CSS custom properties** (`dark.theme.scss` / `light.theme.scss`) — runtime-switchable brand colors
3. **Platform tokens** (`platform.scss`) — `--nav-bar-height`, `--tab-bar-height`, transition curves driven by `data-platform` on `<html>`

`SynkosApp.vue` applies `data-theme="dark|light"` and the boot applies `data-platform="ios|android|web"`.

Auth pages use `--auth-bg`, `--auth-text-primary`, `--auth-surface-*`, `--color-primary` etc. from the CSS vars — change these to rebrand the auth screen without touching any page code.

---

## Key commands

```bash
pnpm dev:frontend          # run apps/frontend in dev mode
pnpm dev:backend           # run apps/backend in dev mode
pnpm sync:templates        # sync apps/ → templates/ (run after feature work)
pnpm build                 # build all packages/
pnpm changeset             # create a new changeset
pnpm release               # build + publish packages with changesets
```

---

## Development workflow

1. **Develop** new features in `apps/frontend` or `apps/backend`
2. **Test** with live reloading and real workspace deps
3. **Run** `pnpm sync:templates` to propagate changes to `templates/`
4. **Commit** both `apps/` and `templates/` changes together
5. **Add changeset** if any `packages/` changed (see below)
6. **Push** following `.claude/workflows/push-git.yaml`

---

## Changesets — when to create one

Only for changes in `packages/` that users will notice:

| Situation                         | Changeset?            | Bump  |
| --------------------------------- | --------------------- | ----- |
| Fix bug in a package              | Yes                   | patch |
| New feature / export in a package | Yes                   | minor |
| Breaking API change               | Yes                   | major |
| Change only in `apps/`            | No                    | —     |
| Change only in `templates/`       | No                    | —     |
| templates/ change visible to user | Yes (`create-synkos`) | patch |
| Docs / style / format             | No                    | —     |

Use `.claude/workflows/push-git.yaml` for the full git flow.

---

## Workflows available

| Workflow                                | When to use                                            |
| --------------------------------------- | ------------------------------------------------------ |
| `.claude/workflows/push-git.yaml`       | Stage, commit, and push following monorepo conventions |
| `.claude/workflows/sync-templates.yaml` | Sync apps/ → templates/ and push the update            |
| `.claude/workflows/plan-task.yaml`      | Analyze a request and decide execution strategy        |

---

## Vite dev configuration notes

`apps/frontend/quasar.config.ts` has critical `optimizeDeps` configuration:

- `@synkos/ui` and `@synkos/client` must be in `include` — they are workspace symlinks and Vite skips them by default, which breaks `cssInjectedByJs` and causes "Failed to resolve component" warnings
- `@capacitor/*` packages must be in `include` — discovered lazily on first navigation causing white-flash reloads in dev
- `vue-i18n` must be in `include` — prevents `@vue/shared` circular dep that causes `isFunction is not a function` on startup
- `server.warmup.clientFiles` pre-transforms LoginPage + HomePage + ProfilePage to eliminate first-navigation reload flashes

When adding new Capacitor plugins, add them to `optimizeDeps.include`.
