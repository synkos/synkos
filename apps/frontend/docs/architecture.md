# Synkos Template — Architecture

## Table of Contents

- [Overview](#overview)
- [Design principle](#design-principle)
- [Directory structure](#directory-structure)
- [Router architecture](#router-architecture)
  - [Layout components](#layout-components)
  - [Tab declaration via meta.tab](#tab-declaration-via-metatab)
  - [Settings routes](#settings-routes)
  - [Custom layouts](#custom-layouts)
  - [Nav bar control from pages](#nav-bar-control-from-pages)
  - [Route meta fields](#route-meta-fields)
  - [Navigation guard](#navigation-guard)
- [Theme system](#theme-system)
  - [Layer 1 — SCSS variables](#layer-1--scss-variables)
  - [Layer 2 — CSS custom properties](#layer-2--css-custom-properties)
  - [Layer 3 — Platform tokens](#layer-3--platform-tokens)
- [Auth pages](#auth-pages)
- [Settings pages](#settings-pages)
- [Page transitions](#page-transitions)
- [Keep-alive strategy](#keep-alive-strategy)
- [Large title pattern](#large-title-pattern)
- [Boot initialization](#boot-initialization)
- [Adding a new tab](#adding-a-new-tab)
- [Adding a custom layout](#adding-a-custom-layout)
- [Adding a settings sub-page](#adding-a-settings-sub-page)

---

## Overview

This template is the frontend workspace for a Synkos app. It's where you develop features before publishing to `create-synkos`.

The template uses:

- **Vue 3** + **Quasar** (build tooling, Capacitor integration)
- **`@synkos/client`** — auth store, API client, boot factories, layout components
- **`@synkos/ui`** — iOS-style UI component library

---

## Design principle

**The framework provides logic and components. You own all pages.**

```
@synkos/client                     apps/frontend/src/
────────────────────────────────   ────────────────────────────────
stores: useAuthStore                pages/auth/LoginPage.vue     ← yours
        useSettingsStore            pages/auth/UsernamePage.vue  ← yours
services: AuthService               pages/settings/**/*.vue      ← yours
          UserService               layouts/OnboardingLayout.vue ← yours
          AccountService            router/settings.routes.ts    ← yours
composables: usePlatform            router/index.ts              ← yours
             useNavAction
             useNavTitle
layouts: MainLayout      → imported and used as route components
         AuthLayout      ↗
```

This means you can customize every screen without forking any package.

---

## Directory structure

```
src/
├── app.config.ts                ← identity, feature flags, links, native settings
├── boot/synkos.ts               ← createSynkosBoot({ config, messages })
│
├── features/                    ← YOUR app code
│   └── home/pages/HomePage.vue
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.vue        ← full auth UI: social, email, OTP, Face ID, username
│   │   └── UsernamePage.vue     ← first-time username picker after OAuth
│   └── settings/
│       ├── ProfilePage.vue
│       ├── components/ProfileHeader.vue
│       ├── account/
│       │   ├── AccountHubPage.vue
│       │   ├── EditProfilePage.vue
│       │   ├── ChangePasswordPage.vue
│       │   ├── ChangeUsernamePage.vue
│       │   ├── DeleteAccountPage.vue
│       │   └── components/SignOutDialog.vue
│       ├── preferences/         ← PreferencesHub, Language
│       ├── notifications/       ← NotificationsHub
│       ├── security/            ← SecurityHub
│       ├── billing/             ← BillingHub — integrate Stripe/RevenueCat here
│       ├── support/             ← SupportHub, Help
│       ├── legal/               ← LegalHub — put your actual terms/privacy here
│       └── about/               ← AboutHub, About
│
├── layouts/
│   └── OnboardingLayout.vue     ← example custom layout (no tab bar, custom header)
│
├── router/
│   ├── index.ts                 ← createRouter + setupSynkosRouter + your guards
│   └── settings.routes.ts      ← explicit route definitions for all settings pages
│
├── css/
│   ├── app.scss                 ← imports all theme files + global animations
│   ├── quasar.variables.scss    ← SCSS design tokens (colors, spacing, typography)
│   ├── dark.theme.scss          ← CSS vars for dark theme (default)
│   ├── light.theme.scss         ← CSS vars for light theme
│   └── platform.scss            ← platform tokens (iOS/Android sizing + transitions)
│
├── i18n/                        ← your app strings (framework strings auto-merged)
├── stores/                      ← your Pinia stores
└── pages/ErrorNotFound.vue
```

---

## Router architecture

The template uses **Quasar-style layout routing** — the same pattern as any standard Vue Router + Quasar app. Layouts are Vue components used directly in route definitions.

```typescript
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client';
import { settingsRoutes } from './settings.routes';

export default defineRouter(() => {
  const router = createRouter({
    history: createWebHashHistory(process.env.VUE_ROUTER_BASE),
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: [
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          { path: 'login', name: 'auth-login', meta: { requiresAuth: false },
            component: () => import('src/pages/auth/LoginPage.vue') },
          { path: 'username', name: 'auth-username', meta: { requiresAuth: false },
            component: () => import('src/pages/auth/UsernamePage.vue') },
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
            component: () => import('src/features/home/pages/HomePage.vue'),
          },
          // Add more tabs here...
          ...settingsRoutes,
        ],
      },
      { path: '/:catchAll(.*)*', component: () => import('src/pages/ErrorNotFound.vue') },
    ],
  });

  setupSynkosRouter(router);           // registers auth guard + tab discovery
  router.beforeEach((to) => { ... });  // your guards run AFTER Synkos's auth guard
  return router;
});
```

### Layout components

| Component    | Source              | Used for                                      |
| ------------ | ------------------- | --------------------------------------------- |
| `MainLayout` | `@synkos/client`    | iOS nav bar + tab bar + router-view           |
| `AuthLayout` | `@synkos/client`    | Full-screen, no chrome (auth, modals, camera) |
| Custom       | `src/layouts/*.vue` | Your own layouts (onboarding, wizards, etc.)  |

### Tab declaration via `meta.tab`

Tabs are declared inline on routes. `setupSynkosRouter` discovers them automatically:

```typescript
{
  path: '',
  name: 'home',
  meta: {
    tab: {
      icon: 'home',            // Material icon name
      labelKey: 'tabs.home',   // i18n key
      cache: true,             // keep-alive (preserves scroll + data)
      componentName: 'HomePage', // Vue component name for keep-alive matching
      badge: unreadCountRef,   // Ref<number> — reactive badge pill
    },
  },
  component: () => import('src/features/home/pages/HomePage.vue'),
}
```

Tabs appear in the order they're declared in the route array.

### Settings routes

All settings routes are defined in `src/router/settings.routes.ts`. This file is yours — add, remove, or reorder sections freely.

```typescript
// src/router/settings.routes.ts
export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: 'profile',
    name: 'profile',
    meta: { tab: { icon: 'person', labelKey: 'tabs.profile' } },
    component: () => import('src/pages/settings/ProfilePage.vue'),
  },
  {
    path: 'settings/account',
    name: 'settings-account',
    meta: { titleKey: 'nav.myAccount' },
    component: () => import('src/pages/settings/account/AccountHubPage.vue'),
  },
  // ... all other settings routes
];
```

### Custom layouts

Add any layout as a new route group. Use `meta.requiresAuth: false` for public routes:

```typescript
// router/index.ts
{
  path: '/onboarding',
  component: () => import('src/layouts/OnboardingLayout.vue'),
  children: [
    {
      path: '',
      name: 'onboarding',
      meta: { requiresAuth: false, canSkip: true, skipTo: 'home' },
      component: () => import('src/pages/OnboardingPage.vue'),
    },
  ],
}
```

The example `OnboardingLayout.vue` demonstrates:

- No tab bar, no nav bar — custom chrome
- Header buttons controlled by `route.meta.canGoBack` and `route.meta.canSkip`
- Safe area insets

### Nav bar control from pages

Two composables let pages control the nav bar:

```typescript
// Inject a trailing action button (e.g. "+" to create)
import { useNavAction } from '@synkos/client';
useNavAction({ icon: 'add', onClick: () => openModal() });
// Clears automatically when the page unmounts.

// Override the nav bar title with dynamic data
import { useNavTitle } from '@synkos/client';
useNavTitle(user.value?.displayName ?? 'Profile');
// Clears automatically when the page unmounts.
```

### Route meta fields

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string; // i18n key → nav bar title
    parentTitleKey?: string; // i18n key → back button label
    requiresAuth?: boolean; // false = public route (used by setupSynkosRouter guard)
    hideTabBar?: boolean; // hide the tab bar on this route
    tab?: TabMeta; // declare this route as a tab
    canGoBack?: boolean; // custom layout: show back button
    canSkip?: boolean; // custom layout: show skip button
    skipTo?: string; // custom layout: route name to skip to
  }
}
```

### Navigation guard

`setupSynkosRouter` installs a guard that:

- Redirects unauthenticated users to `auth-login` (unless `meta.requiresAuth === false`)
- Redirects authenticated + verified users away from the login page
- Redirects to login with `?verify=1` for accounts pending email verification

Your `router.beforeEach()` calls run **after** this guard.

---

## Theme system

Three independent layers, each with a different purpose:

### Layer 1 — SCSS variables (`quasar.variables.scss`)

Compile-time design tokens available in every `<style lang="scss">` block. No import needed — Quasar injects them automatically.

```scss
.my-card {
  background: $surface-2; // rgba(255, 255, 255, 0.06)
  border-radius: $radius-xl; // 14px
  padding: $space-8; // 16px
  font-size: $font-body; // 15px
  color: $text-primary; // rgba(255, 255, 255, 0.95)
}
```

### Layer 2 — CSS custom properties (`dark.theme.scss` / `light.theme.scss`)

Runtime-switchable brand colors applied by `SynkosApp.vue` via `data-theme="dark|light"` on `<html>`. The user switches themes in Settings → Preferences.

```scss
// Customize your brand in dark.theme.scss
:root,
:root[data-theme='dark'] {
  --color-primary: #007aff; // ← change this to rebrand buttons, links, actives
  --auth-bg: #000000; // auth screen background
  --auth-icon-bg: linear-gradient(145deg, #1a1a2e, #16213e); // app icon background
}
```

Auth pages use `--auth-*` tokens. All other UI uses `--color-primary`, `--surface-bg`, `--text-primary`, etc.

### Layer 3 — Platform tokens (`platform.scss`)

Applied via `data-platform="ios|android|web"` on `<html>` (set at boot). MainLayout reads these variables:

```scss
:root[data-platform='ios'] {
  --nav-bar-height: 44px;
  --tab-bar-height: 49px;
  --platform-transition-push: 0.32s cubic-bezier(0.36, 0.66, 0.04, 1);
}

:root[data-platform='android'] {
  --nav-bar-height: 64px;
  --tab-bar-height: 80px;
  --platform-transition-push: 0.3s cubic-bezier(0.2, 0, 0, 1);
}
```

---

## Auth pages

`src/pages/auth/LoginPage.vue` handles the full authentication flow in a single page (multi-step via internal `mode` state):

| Mode       | What it shows                         |
| ---------- | ------------------------------------- |
| `social`   | Apple, Google, email, guest buttons   |
| `login`    | Email + password form                 |
| `register` | Email + password + strength indicator |
| `forgot`   | Email input for password reset        |
| `reset`    | 6-digit OTP + new password            |
| `verify`   | 6-digit OTP for email verification    |
| `username` | Username picker (post-OAuth)          |
| `success`  | Welcome animation                     |

The page imports all its logic from `@synkos/client`:

```typescript
import { useAuthStore, AuthService, UsernameService, getClientConfig } from '@synkos/client';
```

**To customize:** edit `src/pages/auth/LoginPage.vue` freely. The logic stays the same; change the CSS, layout, or branding as needed.

**To add a social provider:** add the OAuth logic in `handleMyProvider()` and call `authStore.loginEmail/Google/Apple(dto)`.

---

## Settings pages

All pages in `src/pages/settings/` import from the public `@synkos/client` API:

```typescript
import { useAuthStore, useSettingsStore, useSignOut, getClientConfig } from '@synkos/client';
import { LegalBottomSheet } from '@synkos/client';
import { AppListRow, AppListSection } from '@synkos/ui';
```

**Key pages to customize:**

| Page                                 | Why you need to edit it                                |
| ------------------------------------ | ------------------------------------------------------ |
| `billing/BillingHubPage.vue`         | Integrate Stripe, RevenueCat, or your payment provider |
| `legal/LegalHubPage.vue`             | Show your actual privacy policy and terms of service   |
| `about/AboutHubPage.vue`             | App Store links, version info, your branding           |
| `preferences/PreferencesHubPage.vue` | Remove/add preference rows                             |

---

## Page transitions

`SynkosApp.vue` handles auth-level transitions by watching `route.path`:

| Navigation            | Transition    | Effect                                               |
| --------------------- | ------------- | ---------------------------------------------------- |
| Any route → `/auth/*` | `login-enter` | Auth screen slides in from top; app scales+fades out |
| `/auth/*` → any route | `login-exit`  | Auth slides out; app scales+fades in                 |

Tab transitions (`tab-slide-left` / `tab-slide-right`) are handled in `MainLayout` and use `var(--platform-transition-push)` for the timing curve.

---

## Keep-alive strategy

Routes with `meta.tab.cache: true` and `meta.tab.componentName` are kept alive between tab switches. The component name must match the `name` option of the Vue component:

```typescript
// router
meta: { tab: { cache: true, componentName: 'HomePage' } }

// component
defineOptions({ name: 'HomePage' })
```

Settings pages and detail views should **not** be cached — they'd show stale state after edits.

---

## Large title pattern

Use `AppPageLargeTitle` at the top of any scrollable page. It auto-collapses into the nav bar on scroll:

```vue
<template>
  <AppPage>
    <AppPageLargeTitle title="My Page" subtitle="Subtitle text" />
    <!-- ... scrollable content -->
  </AppPage>
</template>

<script setup>
import { AppPage, AppPageLargeTitle } from '@synkos/ui';
</script>
```

The component uses `IntersectionObserver` and communicates with `MainLayout` via `inject('synkos:set-nav-title')`. Nav bar shows a crossfade transition between the large title and the compact title.

---

## Boot initialization

`src/boot/synkos.ts` runs the full initialization in order: i18n → API client → background tracking → auth store init → push notifications → splash screen.

```typescript
export default defineBoot(
  createSynkosBoot({
    config: appConfig,
    messages: { 'en-US': enUS, 'es-ES': esES },
    // apiBaseUrl: defaults to VITE_API_URL
    // notifications: { onNotification, onActionPerformed }
    // onLogin: (user) => analytics.identify(user.id),
    // onLogout: () => analytics.reset(),
  }),
);
```

Add your own boots in `src/boot/` and register them in `quasar.config.ts`:

```typescript
boot: ['synkos', 'analytics', 'my-sdk'],
```

---

## Adding a new tab

**1. Create the page:**

```
src/features/feed/pages/FeedPage.vue
```

**2. Add to `router/index.ts` children:**

```typescript
{
  path: 'feed',
  name: 'feed',
  meta: { tab: { icon: 'rss_feed', labelKey: 'tabs.feed' } },
  component: () => import('src/features/feed/pages/FeedPage.vue'),
},
```

**3. Add i18n key:**

```typescript
// src/i18n/en-US/index.ts
tabs: {
  feed: 'Feed';
}
```

That's it — the tab bar updates automatically.

---

## Adding a custom layout

**1. Create the layout in `src/layouts/`:**

```
src/layouts/FullscreenLayout.vue
```

A layout is any Vue component with `<router-view />` in the template. See `OnboardingLayout.vue` for a complete example.

**2. Add to `router/index.ts`:**

```typescript
{
  path: '/fullscreen',
  component: () => import('src/layouts/FullscreenLayout.vue'),
  children: [
    {
      path: 'camera',
      name: 'camera',
      meta: { requiresAuth: false },  // if public
      component: () => import('src/features/camera/pages/CameraPage.vue'),
    },
  ],
}
```

---

## Adding a settings sub-page

**1. Create the page in `src/pages/settings/<section>/`:**

```
src/pages/settings/security/TwoFactorPage.vue
```

**2. Add the route in `router/settings.routes.ts`:**

```typescript
{
  path: 'settings/security/two-factor',
  name: 'settings-security-two-factor',
  meta: { titleKey: 'nav.twoFactor', parentTitleKey: 'nav.security' },
  component: () => import('src/pages/settings/security/TwoFactorPage.vue'),
},
```

**3. Link from the hub page:**

```typescript
router.push({ name: 'settings-security-two-factor' });
```

**4. Add i18n key:**

```typescript
nav: {
  twoFactor: 'Two-Factor Authentication';
}
```

The back button label ("Security") is wired automatically via `parentTitleKey`.
