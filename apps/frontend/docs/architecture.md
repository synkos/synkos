# TGC App — Architecture

## Table of Contents

- [Overview](#overview)
- [The Template Contract](#the-template-contract)
- [Directory Structure](#directory-structure)
- [core/ — Template Infrastructure](#core--template-infrastructure)
  - [Layouts](#layouts)
  - [Auth pages](#auth-pages)
  - [Profile page](#profile-page)
  - [Settings pages](#settings-pages)
  - [Components](#components)
  - [Composables](#composables)
- [features/ — App-Specific Code](#features--app-specific-code)
- [Router Architecture](#router-architecture)
  - [Route modules](#route-modules)
  - [Route naming convention](#route-naming-convention)
  - [RouteMeta — i18n-aware titles](#routemeta--i18n-aware-titles)
  - [Navigation guard](#navigation-guard)
- [iOS Navigation Bar Integration](#ios-navigation-bar-integration)
- [Layout System](#layout-system)
- [Page Transitions](#page-transitions)
- [Keep-Alive Strategy](#keep-alive-strategy)
- [Creating a New App from This Template](#creating-a-new-app-from-this-template)
- [Adding a New App Feature](#adding-a-new-app-feature)
- [Adding a New Settings Sub-Page](#adding-a-new-settings-sub-page)

---

## Overview

This project is a **Quasar + Vue 3 + Capacitor template** designed to be reused across multiple native mobile apps. It ships with a fully working foundation — auth, settings, profile, navigation — so every new app starts with those problems already solved.

The architecture has one core constraint:

> **To build a new app from this template, you should only need to touch `src/features/` and `src/router/routes/app.routes.ts`.**

Everything else (`src/core/`, layouts, settings, auth) is generic infrastructure inherited by every app.

---

## The Template Contract

```
src/core/      ← inherit — do not modify when building a new app
src/features/  ← replace — delete everything and build your own features
```

| Directory   | What it means in practice                                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/`     | Auth flow, all settings sections, profile shell, layouts. Identical across all apps built from this template. Customize only when changing the template itself (e.g. adding a new settings section to the template). |
| `features/` | The actual app. Collection, Grade Center, Scan, Home content, Feed — anything specific to "this" app. When starting a new app, delete the existing features and create your own.                                     |

The other root-level directories (`stores/`, `services/`, `types/`, `i18n/`) are shared and contain a mix of template and app code. Their naming makes the origin clear (`auth.store.ts` = template, `cards.store.ts` = app).

Components and composables follow the same rule — they live inside `core/` or `features/` depending on who uses them, not in a separate top-level `components/` or `composables/` folder.

---

## Directory Structure

```
tgc-app/src/
│
├── core/                              ← TEMPLATE — generic, shared by all apps
│   ├── layouts/
│   │   ├── AuthLayout.vue             Full-screen layout (no tab bar, no nav bar)
│   │   └── MainLayout.vue             App shell: iOS nav bar + tab bar + router-view
│   │
│   ├── components/
│   │   ├── SplashOverlay.vue          Native-feel splash screen on cold start
│   │   ├── LegalBottomSheet.vue       Bottom sheet for legal document display
│   │   ├── ui/                        iOS-style list primitives (no business logic)
│   │   │   ├── AppListSection.vue     Section wrapper with header label
│   │   │   ├── AppListRow.vue         Tappable row with icon, label, hint, chevron
│   │   │   ├── AppListDivider.vue     Inset separator between rows
│   │   │   └── SegmentControl.vue     iOS segmented control (tab-style selector)
│   │   └── navigation/                Components owned by MainLayout
│   │       ├── AppMenuDrawer.vue      Right-side settings drawer with swipe-to-close
│   │       └── DeletionBanner.vue     Persistent banner when account deletion is pending
│   │
│   ├── composables/
│   │   ├── useSettings.ts             Settings state, language switching, notifications toggle
│   │   ├── useSignOut.ts              Sign-out / exit-guest flow + farewell state machine
│   │   ├── useSheetDrag.ts            Rubber-band drag behaviour for bottom sheets
│   │   └── usePullToRefresh.ts        iOS-style pull-to-refresh gesture with haptics
│   │
│   ├── auth/
│   │   └── pages/
│   │       ├── LoginPage.vue          Login, register, forgot password, Face ID prompt
│   │       └── UsernamePickerPage.vue First-time OAuth username selection
│   │
│   ├── profile/
│   │   ├── components/
│   │   │   └── ProfileHeader.vue      Avatar, display name and email header
│   │   └── pages/
│   │       └── ProfilePage.vue        Profile tab shell (stats, sign-out)
│   │
│   └── settings/
│       ├── account/
│       │   ├── components/
│       │   │   └── SignOutDialog.vue   Bottom-sheet sign-out confirmation dialog
│       │   └── pages/
│       │       ├── AccountHubPage.vue
│       │       ├── EditProfilePage.vue
│       │       ├── ChangeUsernamePage.vue
│       │       ├── ChangePasswordPage.vue
│       │       └── DeleteAccountPage.vue
│       ├── preferences/pages/
│       │   ├── PreferencesHubPage.vue
│       │   └── LanguagePage.vue
│       ├── notifications/pages/
│       │   └── NotificationsHubPage.vue
│       ├── security/pages/
│       │   └── SecurityHubPage.vue
│       ├── billing/pages/
│       │   └── BillingHubPage.vue
│       ├── support/pages/
│       │   ├── SupportHubPage.vue
│       │   └── HelpPage.vue
│       ├── legal/pages/
│       │   └── LegalHubPage.vue
│       └── about/pages/
│           ├── AboutHubPage.vue
│           └── AboutPage.vue
│
├── features/                          ← APP-SPECIFIC — replace per app
│   ├── home/pages/
│   │   └── HomePage.vue
│   ├── feed/pages/
│   │   └── FeedPage.vue
│   ├── collection/
│   │   ├── components/
│   │   │   └── CardItem.vue           Single card cell (grid and list variants)
│   │   └── pages/
│   │       ├── CollectionPage.vue
│   │       ├── CardsPage.vue
│   │       └── CatalogPage.vue
│   ├── grade-center/pages/
│   │   └── GradeCenterPage.vue
│   └── scan/
│       ├── components/
│       │   ├── CameraView.vue         Camera feed + capture (native + web fallback)
│       │   └── ScanResult.vue         Identified card result panel
│       └── pages/
│           └── ScanPage.vue
│
├── router/
│   ├── index.ts                       Global navigation guard + router factory
│   └── routes/
│       ├── index.ts                   Assembles all route modules into the final array
│       ├── core.routes.ts             TEMPLATE routes: auth flow + profile tab
│       ├── settings.routes.ts         TEMPLATE routes: all /settings/* sections
│       └── app.routes.ts              APP routes: tab content + full-screen experiences
│
├── stores/                            Pinia stores (core + app mixed)
├── services/                          API services (core + app mixed)
├── types/                             TypeScript interfaces (core + app mixed)
├── i18n/                              Translations (en-US, es-ES)
├── boot/                              Quasar boot files
├── pages/
│   └── ErrorNotFound.vue              Global 404 page
└── App.vue                            Root component — layout transitions + splash
```

---

## core/ — Template Infrastructure

### Layouts

Two layouts serve fundamentally different purposes:

| Layout           | Path            | Used for                                                                                                                                          |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthLayout.vue` | `core/layouts/` | Full-screen experiences: login, username picker, and any app-specific full-screen flows (e.g. camera scanner). No tab bar, no nav bar.            |
| `MainLayout.vue` | `core/layouts/` | The main app shell. Renders the iOS navigation bar, the tab bar, `<router-view>`, and the `DeletionBanner`. Used for all tab and settings routes. |

### Auth pages

`LoginPage.vue` is a self-contained multi-step flow: login, register, forgot password, email verification, password reset, and Face ID offer. It lives in `core/auth/pages/` because every app needs authentication and this page does not reference any app-specific feature.

`UsernamePickerPage.vue` is shown after a first-time OAuth sign-in when the user has no username yet.

### Profile page

`ProfilePage.vue` is the profile tab shell. It shows the user avatar, display name, and stats row. The stats values (graded cards, collections, wishlist) come from app-specific stores — customize the stats section per app without moving the file.

### Settings pages

All settings sections live under `core/settings/`. Each section follows the same pattern:

```
core/settings/<section>/pages/
  <Section>HubPage.vue     ← hub/index for that section (list of sub-options)
  <SubPage>.vue            ← individual sub-pages (one per option)
```

The hub pages use `AppListSection` + `AppListRow` components with i18n labels and navigate to sub-pages by route name. Sub-pages that are not yet implemented are listed as commented-out routes in `settings.routes.ts` — uncomment and create the page when needed.

### Components

Components inside `core/` are split by purpose:

#### `core/components/ui/` — iOS list primitives

Purely presentational components with no business logic or store dependencies. Used by every settings hub page and any future page that needs an iOS-style list.

| Component        | Props                                                                                               | Purpose                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `AppListSection` | `title?: string`                                                                                    | Wraps a group of rows with an optional uppercase section header |
| `AppListRow`     | `label`, `hint?`, `icon?`, `iconColor?`, `iconBg?`, `danger?`, `disabled?`, `comingSoon?`, `value?` | Tappable row supporting button and display-only variants        |
| `AppListDivider` | `indent?: number`                                                                                   | Hairline separator between rows, with optional left inset       |
| `SegmentControl` | `options`, `modelValue`                                                                             | iOS-style segmented selector, used in preference pages          |

#### `core/components/navigation/` — Shell components

Tightly coupled to `MainLayout`. Not intended for use in pages directly.

| Component        | Purpose                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppMenuDrawer`  | Right-side settings drawer opened from the profile menu button. Includes swipe-to-close gesture with backdrop opacity sync and haptic feedback at the dismiss threshold. |
| `DeletionBanner` | Sticky banner shown at the top of every page when an account deletion is pending. Navigates to `settings-account-delete` on tap.                                         |

#### `core/components/` — Generic core components

| Component          | Purpose                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `SplashOverlay`    | Native-feel launch screen shown on Capacitor cold start. Emits `done` when its exit animation completes.                   |
| `LegalBottomSheet` | Bottom sheet for displaying legal documents (terms, privacy policy). Used in `LoginPage`, `LegalHubPage`, and `AboutPage`. |

#### Feature-scoped components

Components used by a single section live next to that section, not in `core/components/`:

| Component       | Location                            | Used by               |
| --------------- | ----------------------------------- | --------------------- |
| `ProfileHeader` | `core/profile/components/`          | `ProfilePage` only    |
| `SignOutDialog` | `core/settings/account/components/` | `AccountHubPage` only |

This keeps the scope visible from the file path — if a component is not in `core/components/`, it belongs to one specific page or section.

---

### Composables

All composables that can be used across both `core/` and `features/` live in `core/composables/`. There is no separate top-level `composables/` directory.

#### `useSettings`

**File:** `core/composables/useSettings.ts`

Encapsulates the full settings interaction layer: reading and writing language, card language, haptics, grid size, and notification preferences. Also exposes navigation to `settings-account-delete`.

Used by: `PreferencesHubPage`, `LanguagePage`, and indirectly by stores that read settings on init.

#### `useSignOut`

**File:** `core/composables/useSignOut.ts`

Manages the sign-out and exit-guest flow: dialog visibility, a two-state machine (`confirm` → `farewell`), haptic feedback, and the final `authStore.logout()` + redirect to `auth-login`.

Used by: `AccountHubPage`.

#### `useSheetDrag`

**File:** `core/composables/useSheetDrag.ts`

Provides iOS rubber-band drag behaviour for bottom sheets. Returns `sheetDragStyle` (a computed CSS transform) and touch event handlers. The drag applies exponential resistance so the sheet feels anchored rather than free-floating.

Used by: `SignOutDialog`. Can be added to any other bottom sheet component.

#### `usePullToRefresh`

**File:** `core/composables/usePullToRefresh.ts`

iOS-style pull-to-refresh gesture. Accepts an async `onRefresh` callback, handles drag resistance, the visual indicator, the snap-back animation, and haptic feedback at the trigger threshold. Designed to work with any scrollable page.

**Usage:**

```typescript
const { pullState, pullY, isSnapping, onTouchStart, onTouchMove, onTouchEnd } = usePullToRefresh(
  () => store.fetchData(),
);
```

Currently used by `CollectionPage` and `CatalogPage`. Available to all pages in `core/` and `features/`.

---

## features/ — App-Specific Code

Everything in `features/` belongs to the current app (TGC Grading). When reusing this template for a new app:

1. Delete the entire `features/` directory.
2. Create new feature directories for the new app's functionality.
3. Update `app.routes.ts` to register the new routes.

A feature directory groups everything it needs, co-located by feature rather than by file type:

```
features/<feature-name>/
  pages/          ← route-level components
  components/     ← components used only within this feature
  composables/    ← composables used only within this feature
```

Only create `components/` or `composables/` subdirectories when they are actually needed. A feature with a single page and no shared sub-components only needs `pages/`.

**Rule for promoting to `core/composables/`:** if a composable currently in a feature starts being used by a second unrelated feature or by any `core/` page, move it to `core/composables/` at that point. Don't move it preemptively.

---

## Router Architecture

### Route modules

The router is split into four files under `src/router/routes/`:

| File                 | Contents                                               | Who maintains it |
| -------------------- | ------------------------------------------------------ | ---------------- |
| `core.routes.ts`     | Auth route group (`/auth/*`) and the profile tab route | Template         |
| `settings.routes.ts` | All `/settings/*` routes with their sub-page tree      | Template         |
| `app.routes.ts`      | App tab routes and full-screen app experiences         | App developer    |
| `index.ts`           | Assembles all modules into the final `routes` array    | Both             |

**`index.ts` assembly:**

```typescript
const routes = [
  coreAuthRoute, // /auth/login, /auth/username — AuthLayout
  appFullscreen, // /app/scan (and future app full-screen routes) — AuthLayout
  {
    path: '/',
    component: MainLayout,
    children: [
      ...appTabRoutes, // home, collection, grade-center, feed
      coreProfileRoute, // profile
      ...coreSettingsRoutes, // /settings/*
    ],
  },
  { path: '/:catchAll(.*)*', component: ErrorNotFound },
];
```

The key design decision: **`profile` is declared in `core.routes.ts`**, not in `app.routes.ts`. This ensures every app always has the profile tab — it cannot be accidentally removed. App developers add their own tabs to `appTabRoutes` without touching the profile.

### Route naming convention

All route names follow a kebab-case hierarchy mirroring the URL structure:

```
auth-login                   → /auth/login
auth-username                → /auth/username
profile                      → /profile
home                         → /
collection                   → /collection
collection-cards             → /collection/:slug/cards
scan                         → /app/scan

settings-account             → /settings/account
settings-account-edit        → /settings/account/edit
settings-account-username    → /settings/account/username
settings-account-password    → /settings/account/password
settings-account-delete      → /settings/account/delete

settings-preferences         → /settings/preferences
settings-preferences-language → /settings/preferences/language
settings-preferences-appearance → /settings/preferences/appearance (planned)

settings-notifications       → /settings/notifications
settings-security            → /settings/security
settings-billing             → /settings/billing
settings-support             → /settings/support
settings-support-help        → /settings/support/help
settings-legal               → /settings/legal
settings-about               → /settings/about
```

**Rule:** always navigate by name, never by path. This decouples all components from URL structure.

```typescript
// ✅ correct
router.push({ name: 'settings-account-edit' });

// ❌ avoid
router.push('/settings/account/edit');
```

### RouteMeta — i18n-aware titles

Route `meta` is extended with two fields used by `MainLayout.vue` to drive the iOS navigation bar:

```typescript
declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string; // i18n key → resolved to page title
    parentTitleKey?: string; // i18n key → resolved to back button label
    requiresAuth?: boolean; // guards requiring a non-guest user
  }
}
```

**Never hardcode strings in route meta.** Always use i18n keys:

```typescript
// ✅ correct — reactive to locale changes
{
  path: 'settings/account/edit',
  name: 'settings-account-edit',
  meta: {
    titleKey: 'nav.editProfile',
    parentTitleKey: 'nav.myAccount',
  },
  component: () => import('src/core/settings/account/pages/EditProfilePage.vue'),
}

// ❌ wrong — hardcoded, breaks on locale change
{
  meta: { title: 'Edit Profile', parentTitle: 'My Account' }
}
```

`MainLayout.vue` resolves the keys with `t()`:

```typescript
const pageTitle = computed(() => {
  if (collectionSlug.value) return currentCollection.value?.name ?? collectionSlug.value;
  if (route.meta?.titleKey) return t(route.meta.titleKey);
  // tab paths fall back to tab labels
  if (route.path === '/collection')   return t('tabs.collection');
  if (route.path === '/grade-center') return t('tabs.grades');
  ...
  return t('nav.appTitle');
});

const parentTitle = computed(() => {
  if (route.meta?.parentTitleKey) return t(route.meta.parentTitleKey);
  return t('nav.back');
});
```

Because the title is a computed based on a reactive i18n translation, changing the app language instantly updates the nav bar — no route reload required.

### Navigation guard

A single global `beforeEach` guard in `src/router/index.ts` handles all auth-related redirects:

```typescript
Router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const isPublicRoute = to.name === 'auth-login';
  const canAccess = authStore.isAuthenticated || authStore.isGuest;

  // Already has session → skip the login screen
  if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
    return { name: 'home' };
  }

  // No session → force login
  if (!isPublicRoute && !canAccess) {
    return { name: 'auth-login' };
  }

  // Has account but email not verified → back to login for verification
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

The guard uses dynamic import for `useAuthStore` to avoid a circular dependency between the router and the store (both used in boot files).

---

## iOS Navigation Bar Integration

`MainLayout.vue` renders an iOS-style navigation bar that:

- Shows **no back button** on root tab routes (`/`, `/collection`, `/grade-center`, `/feed`, `/profile`).
- Shows a **back button** on all other routes, with the label resolved from `route.meta.parentTitleKey`.
- Shows the **menu button** (hamburger) only on the `/profile` route.
- Highlights the **correct tab** in the tab bar for all routes, including settings sub-pages.

**Tab active logic** — all `/settings/*` routes highlight the Profile tab:

```typescript
function isTabActive(tab: { path: string }) {
  if (tab.path === '/profile') {
    return route.path === '/profile' || route.path.startsWith('/settings');
  }
  return route.path.startsWith(tab.path);
}
```

**Sub-route detection:**

```typescript
const isSubRoute = computed(() => tabs.value.every((tab) => tab.path !== route.path));
```

Any route that is not a direct tab path is treated as a sub-route and gets a back button.

---

## Layout System

There are exactly two layouts and the choice is made at the route level:

```
AuthLayout      → /auth/*  and  /app/*  (full-screen, no chrome)
MainLayout      → /*  (app shell with tab bar and nav bar)
```

To add a new full-screen experience (e.g. an onboarding flow):

```typescript
// app.routes.ts
export const appFullscreen: RouteRecordRaw = {
  path: '/app',
  component: () => import('src/core/layouts/AuthLayout.vue'),
  children: [
    { path: 'scan', name: 'scan', component: () => import('...') },
    { path: 'onboarding', name: 'onboarding', component: () => import('...') }, // add here
  ],
};
```

---

## Page Transitions

`App.vue` handles two top-level transitions triggered by route name changes:

| Trigger                               | Transition    | Effect                                                           |
| ------------------------------------- | ------------- | ---------------------------------------------------------------- |
| Navigating **to** `auth-login`        | `login-enter` | Login slides in from the top; main app scales down and fades out |
| Navigating **away from** `auth-login` | `login-exit`  | Login slides out to the top; main app scales up and fades in     |

These transitions run at the `App.vue` level (not `MainLayout`) so they cover the entire viewport without interference from the nav bar or tab bar.

Tab-to-tab transitions (`tab-slide-left` / `tab-slide-right`) are handled inside `MainLayout.vue` and are directional — swiping right animates leftward, swiping left animates rightward — mirroring native iOS tab bar behaviour.

---

## Keep-Alive Strategy

`MainLayout.vue` uses `<keep-alive>` to preserve component state for tabs where it matters:

```typescript
const cachedViews = ['CollectionPage', 'HomePage'];
```

**Why only these two?**

- `CollectionPage` — fetches a list of collections on mount. Caching avoids a network request every time the user switches tabs.
- `HomePage` — placeholder; cached as a best practice for the root tab.

Pages that should **not** be cached (settings pages, detail views) are excluded. Caching a settings page would show stale form state if the user edits their profile, navigates away, and returns.

The `routeKey` computed forces a fresh component instance for collection sub-pages:

```typescript
const routeKey = computed(() => {
  if (collectionSlug.value) return `cards-${collectionSlug.value}`;
  return route.path;
});
```

This ensures switching from the Pokémon collection to the One Piece collection creates a fresh `CardsPage` rather than re-using the cached one with wrong data.

---

## Creating a New App from This Template

### 1. Clone and install

```bash
git clone <template-repo> my-new-app
cd my-new-app/tgc-app
pnpm install
```

### 2. Remove app-specific features

```bash
rm -rf src/features/collection
rm -rf src/features/grade-center
rm -rf src/features/scan
rm -rf src/features/home
rm -rf src/features/feed
```

Remove app-specific stores, services, and types:

```bash
rm src/stores/cards.store.ts
rm src/stores/catalog.store.ts
rm src/stores/collections.store.ts
rm src/stores/graded-cards.store.ts
rm src/stores/scan.store.ts
rm src/services/cards.service.ts
# ... etc
```

### 3. Replace app routes

Edit `src/router/routes/app.routes.ts`:

```typescript
export const appTabRoutes: RouteRecordRaw[] = [
  { path: '', name: 'home', component: () => import('src/features/home/pages/HomePage.vue') },
  {
    path: 'my-feature',
    name: 'my-feature',
    component: () => import('src/features/my-feature/pages/MyFeaturePage.vue'),
  },
  // add your tabs here
];

export const appFullscreen: RouteRecordRaw = {
  path: '/app',
  component: () => import('src/core/layouts/AuthLayout.vue'),
  children: [
    // add app-specific full-screen routes here
  ],
};
```

### 4. Create your features

```
src/features/
  home/pages/HomePage.vue
  my-feature/pages/MyFeaturePage.vue
```

### 5. Update the tab bar labels

In `src/core/layouts/MainLayout.vue` (or the i18n files), update the `tabs` computed to match your new feature names:

```typescript
const tabs = computed(() => [
  { path: '/', label: t('tabs.home'), icon: 'home' },
  { path: '/my-feature', label: t('tabs.myFeature'), icon: 'star' },
  { path: '/profile', label: t('tabs.profile'), icon: 'person' },
]);
```

### 6. Customize branding

- App name, bundle ID, icons: `capacitor.config.ts` + Xcode
- Colors, fonts: `src/css/`
- i18n strings: `src/i18n/en-US/index.ts`, `src/i18n/es-ES/index.ts`

**Everything in `src/core/` can be left untouched.** Auth, settings, profile, and navigation are ready to use.

---

## Adding a New App Feature

A feature is a self-contained directory with its own pages, and optionally its own components, composables, and types.

### 1. Create the feature directory

```
src/features/wishlist/
  pages/
    WishlistPage.vue
  components/
    WishlistItem.vue
```

### 2. Register the route in `app.routes.ts`

```typescript
export const appTabRoutes: RouteRecordRaw[] = [
  // ... existing routes
  {
    path: 'wishlist',
    name: 'wishlist',
    component: () => import('src/features/wishlist/pages/WishlistPage.vue'),
  },
];
```

### 3. Add the tab to MainLayout

```typescript
const tabs = computed(() => [
  // ... existing tabs
  { path: '/wishlist', label: t('tabs.wishlist'), icon: 'bookmark' },
]);
```

### 4. Add i18n keys

```typescript
// src/i18n/en-US/index.ts
tabs: {
  wishlist: 'Wishlist',
},
pages: {
  wishlist: {
    title: 'My Wishlist',
    empty: 'No items yet',
  },
}
```

For full-screen experiences (no tab bar), add to `appFullscreen.children` in `app.routes.ts` instead.

---

## Adding a New Settings Sub-Page

Settings sub-pages live in `src/core/settings/<section>/pages/`. They are part of the template because every app built from this template inherits the same settings structure.

### 1. Create the page file

```
src/core/settings/security/pages/TwoFactorPage.vue
```

### 2. Uncomment or add the route in `settings.routes.ts`

```typescript
// settings.routes.ts
{
  path: 'settings/security/two-factor',
  name: 'settings-security-two-factor',
  meta: {
    titleKey: 'pages.settings.seguridadSection.dosFactor',
    parentTitleKey: 'nav.security',
  },
  component: () => import('src/core/settings/security/pages/TwoFactorPage.vue'),
},
```

### 3. Link to it from the hub page

```typescript
// SecurityHubPage.vue
router.push({ name: 'settings-security-two-factor' });
```

### 4. Add i18n keys if needed

The `pages.settings.seguridadSection.*` namespace in `src/i18n/` already has keys for all planned security sub-pages. Check there before adding new ones.

The back button label is automatic — `parentTitleKey: 'nav.security'` resolves to "Security" / "Seguridad" and is displayed in the iOS nav bar without any additional wiring.
