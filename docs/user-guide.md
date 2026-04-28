# Synkos — User Guide

## Table of Contents

1. [What is Synkos?](#1-what-is-synkos)
2. [Creating a new project](#2-creating-a-new-project)
3. [Project structure](#3-project-structure)
4. [Configuration (`app.config.ts`)](#4-configuration-appconfigts)
5. [Your first feature](#5-your-first-feature)
6. [Routing](#6-routing)
7. [Internationalization (i18n)](#7-internationalization-i18n)
8. [Styling and theming](#8-styling-and-theming)
9. [Boot file](#9-boot-file)
10. [Auth pages](#10-auth-pages)
11. [Settings pages](#11-settings-pages)
12. [Custom layouts](#12-custom-layouts)
13. [Nav bar extensions](#13-nav-bar-extensions)
14. [Making API calls](#14-making-api-calls)
15. [Native features](#15-native-features)
16. [UI Components (`@synkos/ui`)](#16-ui-components-synkosui)
17. [Feature flags](#17-feature-flags)

---

## 1. What is Synkos?

Synkos is a fullstack framework for building mobile and web apps with Vue 3 + Quasar (frontend) and Node + Express (backend). When you run `pnpm create synkos`, you get a complete, ready-to-run project with:

- **Authentication** — Email, Google, Apple Sign In, email verification, password reset, Face ID
- **Settings** — Account management, preferences, notifications, security, billing, support, legal, about
- **Profile** — User profile, avatar upload, username, sign-out
- **Navigation** — iOS-style tab bar, nav bar with back buttons, page transitions
- **Backend** — REST API, JWT auth, MongoDB, push notifications

**Key design principle:** The framework owns the logic (stores, services, composables). You own all the UI pages. Every page that users see — auth, settings, profile — lives in your project and is fully editable.

---

## 2. Creating a new project

```bash
pnpm create synkos
```

Follow the prompts to name your app and choose what to include (frontend only, backend only, or both).

After scaffolding:

```bash
cd my-app/frontend
pnpm install
pnpm dev
```

> For iOS development, use `pnpm dev:ios` instead of `pnpm dev`.

---

## 3. Project structure

```
src/
├── app.config.ts              ← The only file you MUST edit to start
│
├── boot/synkos.ts             ← Single boot file — initializes everything
│
├── features/                  ← YOUR app code goes here
│   └── home/pages/HomePage.vue
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.vue      ← Auth UI — yours to edit
│   │   └── UsernamePage.vue   ← Username picker — yours to edit
│   └── settings/              ← All settings pages — yours to edit
│       ├── ProfilePage.vue
│       ├── account/           ← Account management
│       ├── billing/           ← Integrate your payment provider here
│       ├── legal/             ← Put your real terms/privacy here
│       └── ...
│
├── layouts/
│   └── OnboardingLayout.vue   ← Example custom layout
│
├── router/
│   ├── index.ts               ← Router setup (edit to add tabs/layouts)
│   └── settings.routes.ts     ← Settings routes (edit to add/remove sections)
│
├── i18n/
│   ├── en-US/index.ts         ← Your English strings
│   └── es-ES/index.ts         ← Your Spanish strings
│
└── css/
    ├── app.scss               ← Global styles
    ├── quasar.variables.scss  ← Design tokens (SCSS variables)
    ├── dark.theme.scss        ← Dark theme CSS custom properties
    ├── light.theme.scss       ← Light theme CSS custom properties
    └── platform.scss          ← iOS/Android sizing and transition tokens
```

---

## 4. Configuration (`app.config.ts`)

This is the first file you edit.

```typescript
export const appConfig: AppConfig = {
  name: 'My App',
  version: '1.0.0',
  bundleId: 'com.mycompany.myapp',

  company: {
    name: 'My Company',
    legalName: 'My Company, Inc.',
    country: 'US',
    jurisdiction: 'Delaware',
  },

  storageKeys: {
    settings: 'myapp-settings', // change per app to avoid collisions
    pushToken: 'myapp-push-token',
    pushTokenRegistered: 'myapp-push-token-registered',
  },

  features: {
    googleAuth: true, // show Google sign-in button
    appleAuth: true, // show Apple sign-in button (iOS only)
    faceId: true, // offer Face ID after first login
    guestMode: false, // allow using app without account
    pushNotifications: true, // enable APNs/FCM push
  },

  links: {
    website: 'https://myapp.com',
    contactEmail: 'legal@myapp.com',
    supportEmail: 'support@myapp.com',
    privacyPolicy: 'https://myapp.com/privacy',
    termsOfService: 'https://myapp.com/terms',
    appStore: { ios: '', android: '' },
  },

  native: {
    ios: { contentInset: 'never' },
    splashScreen: { backgroundColor: '#000000', showSpinner: false, fadeOutDuration: 250 },
    pushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
};
```

---

## 5. Your first feature

### Step 1 — Create the page

```
src/features/dashboard/pages/DashboardPage.vue
```

### Step 2 — Register the route and tab in `router/index.ts`

```typescript
// Inside MainLayout children:
{
  path: 'dashboard',
  name: 'dashboard',
  meta: {
    tab: {
      icon: 'dashboard',       // Material icon name
      labelKey: 'tabs.dashboard', // i18n key
    },
  },
  component: () => import('src/features/dashboard/pages/DashboardPage.vue'),
},
```

### Step 3 — Add translations

```typescript
// src/i18n/en-US/index.ts
tabs: {
  dashboard: 'Dashboard';
}
```

That's it — the tab appears automatically.

---

## 6. Routing

### Route structure

The router uses standard Vue Router + Quasar layout routing. Each section uses its own layout component:

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
      // Auth — full-screen, no chrome
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          {
            path: 'login',
            name: 'auth-login',
            meta: { requiresAuth: false },
            component: () => import('src/pages/auth/LoginPage.vue'),
          },
          {
            path: 'username',
            name: 'auth-username',
            meta: { requiresAuth: false },
            component: () => import('src/pages/auth/UsernamePage.vue'),
          },
        ],
      },

      // Main app shell — nav bar + tab bar
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '',
            name: 'home',
            meta: {
              tab: { icon: 'home', labelKey: 'tabs.home', cache: true, componentName: 'HomePage' },
            },
            component: () => import('src/features/home/pages/HomePage.vue'),
          },
          // Add your tabs here ↑
          ...settingsRoutes,
        ],
      },

      // Your custom layouts
      {
        path: '/onboarding',
        component: () => import('src/layouts/OnboardingLayout.vue'),
        children: [
          {
            path: '',
            name: 'onboarding',
            meta: { requiresAuth: false },
            component: () => import('src/pages/OnboardingPage.vue'),
          },
        ],
      },

      { path: '/:catchAll(.*)*', component: () => import('src/pages/ErrorNotFound.vue') },
    ],
  });

  setupSynkosRouter(router); // auth guard + tab auto-discovery
  return router;
});
```

### Tab declaration

Declare tabs inline via `meta.tab`. They're discovered automatically:

```typescript
meta: {
  tab: {
    icon: 'home',               // Material icon
    labelKey: 'tabs.home',      // i18n key
    cache: true,                // keep-alive (preserve scroll + state)
    componentName: 'HomePage',  // component name for keep-alive matching
    badge: unreadCountRef,      // Ref<number> — reactive badge
  }
}
```

### Route meta reference

| Field            | Type      | Used by           | Purpose                           |
| ---------------- | --------- | ----------------- | --------------------------------- |
| `titleKey`       | `string`  | MainLayout        | i18n key for nav bar title        |
| `parentTitleKey` | `string`  | MainLayout        | i18n key for back button label    |
| `requiresAuth`   | `boolean` | setupSynkosRouter | `false` = public route            |
| `hideTabBar`     | `boolean` | MainLayout        | Hide tab bar on this route        |
| `tab`            | `TabMeta` | setupSynkosRouter | Declare as tab                    |
| `canGoBack`      | `boolean` | Custom layouts    | Show back button in custom layout |
| `canSkip`        | `boolean` | Custom layouts    | Show skip button in custom layout |
| `skipTo`         | `string`  | Custom layouts    | Route name to navigate on skip    |

### Navigation guard

`setupSynkosRouter` installs:

- Redirect unauthenticated → `auth-login` (unless `requiresAuth: false`)
- Redirect authenticated → home (if trying to access login)
- Redirect unverified email → login with `?verify=1`

Add your own guards after `setupSynkosRouter(router)`:

```typescript
setupSynkosRouter(router);

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return { name: 'home' };
  }
});
```

---

## 7. Internationalization (i18n)

Your app strings live in `src/i18n/`. Core strings (auth, settings, nav) are merged automatically.

```typescript
// src/i18n/en-US/index.ts
export default {
  tabs: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
  },
  pages: {
    dashboard: {
      title: 'Dashboard',
      empty: 'No data yet.',
    },
  },
};
```

TypeScript autocompletion is pre-configured in `src/i18n/index.ts` — `t('...')` is fully type-safe.

### Adding a language

```typescript
// src/boot/synkos.ts
import frFR from 'src/i18n/fr-FR';

createSynkosBoot({
  config: appConfig,
  messages: { 'en-US': enUS, 'es-ES': esES, 'fr-FR': frFR },
});
```

---

## 8. Styling and theming

### SCSS variables (compile-time)

Available in every `<style lang="scss">` block without imports:

```scss
.card {
  background: $surface-2; // rgba(255, 255, 255, 0.06)
  border-radius: $radius-xl; // 14px
  padding: $space-8; // 16px
  font-size: $font-body; // 15px
  color: $text-primary; // rgba(255, 255, 255, 0.95)
  transition: opacity $transition-quick;
}
```

### CSS custom properties (runtime)

Switch at runtime based on `data-theme` on `<html>`. Edit `dark.theme.scss` and `light.theme.scss`:

```scss
// src/css/dark.theme.scss — change to rebrand
:root,
:root[data-theme='dark'] {
  --color-primary: #007aff; // buttons, links, active states
  --color-secondary: #30d158; // success states
  --surface-bg: #000000; // page background
}
```

### Auth page tokens

The auth pages (`LoginPage.vue`, `UsernamePage.vue`) use dedicated tokens:

```scss
:root {
  --auth-bg: #000000; // login screen background
  --auth-icon-bg: linear-gradient(145deg, #1a1a2e, #16213e); // app icon
  --auth-text-primary: rgba(255, 255, 255, 0.92);
  --auth-surface-1: rgba(255, 255, 255, 0.07); // input fields
}
```

### Platform tokens

`platform.scss` drives platform-specific sizing via `data-platform` on `<html>`:

```scss
// Override for your brand:
:root[data-platform='ios'] {
  --nav-bar-height: 44px; // keep default or adjust
  --platform-transition-push: 0.32s cubic-bezier(0.36, 0.66, 0.04, 1);
}
```

---

## 9. Boot file

```typescript
// src/boot/synkos.ts
export default defineBoot(
  createSynkosBoot({
    config: appConfig,
    messages: { 'en-US': enUS, 'es-ES': esES },
    // apiBaseUrl: defaults to VITE_API_URL
    onLogin: (user) => analytics.identify(user.id),
    onLogout: () => analytics.reset(),
    notifications: {
      onNotification: (n) => showInAppBanner(n.title, n.body),
      onActionPerformed: (action) => {
        const data = action.notification.data as { screen?: string };
        if (data.screen) router.push({ name: data.screen });
      },
    },
  })
);
```

Add your own boots for other SDKs:

```typescript
// quasar.config.ts
boot: ['synkos', 'analytics', 'my-sdk'];

// src/boot/analytics.ts
export default defineBoot(({ router }) => {
  analytics.init({ apiKey: import.meta.env.VITE_ANALYTICS_KEY });
});
```

---

## 10. Auth pages

`src/pages/auth/LoginPage.vue` is yours to edit. It imports everything it needs from `@synkos/client`:

```typescript
import { useAuthStore, AuthService, UsernameService, getClientConfig } from '@synkos/client';
```

**Common customizations:**

- Change the app icon in the header (replace the `<AppIcon name="style">` placeholder)
- Adjust colors by editing `--auth-*` tokens in `dark.theme.scss`
- Add or remove social providers
- Change the welcome tagline in your i18n files (`pages.auth.tagline`)

The auth logic (token storage, biometric, session restore) stays in `useAuthStore` — you don't need to touch it.

---

## 11. Settings pages

All pages in `src/pages/settings/` are yours. They import from `@synkos/client`:

```typescript
import {
  useAuthStore,
  useSettingsStore,
  useSignOut,
  getClientConfig,
  LegalBottomSheet,
} from '@synkos/client';
import { AppListRow, AppListSection, AppListDivider } from '@synkos/ui';
```

**Key pages to customize:**

| Page                      | Typical customization                           |
| ------------------------- | ----------------------------------------------- |
| `billing/BillingHub`      | Integrate Stripe, RevenueCat, or custom billing |
| `legal/LegalHub`          | Show your real privacy policy and terms         |
| `about/AboutHub`          | App Store links, rate button, version info      |
| `preferences/Preferences` | Add or remove preference rows                   |

To add a new settings sub-page:

1. Create the file in `src/pages/settings/<section>/`
2. Add the route to `src/router/settings.routes.ts`
3. Link to it from the hub page via `router.push({ name: 'settings-<section>-<name>' })`

---

## 12. Custom layouts

A layout is any Vue component with `<router-view />`. Create yours in `src/layouts/`:

```vue
<!-- src/layouts/FullscreenLayout.vue -->
<template>
  <div class="my-layout">
    <!-- your chrome here (or none) -->
    <router-view />
  </div>
</template>
```

Register it in `router/index.ts`:

```typescript
{
  path: '/camera',
  component: () => import('src/layouts/FullscreenLayout.vue'),
  children: [
    { path: '', name: 'camera', component: () => import('src/features/camera/CameraPage.vue') },
  ],
}
```

See `src/layouts/OnboardingLayout.vue` for a complete example with:

- Custom header (back + skip buttons driven by `route.meta`)
- Safe area insets
- Full-screen scrollable content

---

## 13. Nav bar extensions

### Dynamic title

Override the nav bar title with runtime data (e.g. user name, content title):

```typescript
import { useNavTitle } from '@synkos/client';

// In any page component:
useNavTitle(user.value?.displayName ?? 'Profile');
// Clears automatically when the page unmounts.
```

### Trailing action button

Inject an action button (e.g. "+" or edit) into the nav bar's trailing slot:

```typescript
import { useNavAction } from '@synkos/client';

useNavAction({
  icon: 'add',
  onClick: () => openCreateModal(),
});
// Clears automatically when the page unmounts.
```

### Large title (collapsible)

Use `AppPageLargeTitle` at the top of any scrollable page. It automatically collapses into the nav bar when scrolled past:

```vue
<template>
  <AppPage>
    <AppPageLargeTitle title="Dashboard" subtitle="Your activity" />
    <!-- content below scrolls under the large title -->
  </AppPage>
</template>
```

---

## 14. Making API calls

```typescript
import { getApiClient } from '@synkos/client';

const api = getApiClient();
// Authorization header is injected automatically
// 401 → silent token refresh → retry
const response = await api.get('/my-endpoint');
```

Create services as plain objects:

```typescript
// src/services/products.service.ts
import { getApiClient } from '@synkos/client';

export const ProductsService = {
  async list() {
    const res = await getApiClient().get<{ data: Product[] }>('/products');
    return res.data.data;
  },
};
```

Set the API URL in `.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 15. Native features

### Platform detection

```typescript
import { usePlatform } from '@synkos/client';

const { isIOS, isAndroid, isNative, isWeb } = usePlatform();
```

### Haptics

```typescript
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
```

Always `.catch(() => undefined)` — haptics throw on web.

### Pull-to-refresh

```typescript
import { usePullToRefresh } from '@synkos/client';

const { pullState, wrapperStyle, arrowStyle, onTouchStart, onTouchMove, onTouchEnd } =
  usePullToRefresh(() => store.fetchData());
```

### Push notifications

Configured automatically at boot. See [§9 Boot file](#9-boot-file) for `onNotification` / `onActionPerformed` handlers.

```typescript
import { notificationsService } from '@synkos/client';

const status = await notificationsService.checkPermissionStatus();
// 'granted' | 'denied' | 'prompt' | 'unavailable'
```

### Face ID

Handled entirely by `useAuthStore`. After first login, if biometrics are available and the user hasn't been prompted yet, the login page shows a Face ID offer sheet automatically.

---

## 16. UI Components (`@synkos/ui`)

### Components

```typescript
import {
  AppButton,
  AppListRow,
  AppListSection,
  AppListDivider,
  AppIcon,
  AppPage,
  AppPageLargeTitle,
  AppBottomSheet,
  AppDrawer,
  AppSpinner,
  AppCircularProgress,
  AppEmptyState,
  SegmentControl,
} from '@synkos/ui';
```

### AppButton

```vue
<AppButton @click="save">Save</AppButton>
<AppButton variant="ghost" @click="cancel">Cancel</AppButton>
<AppButton variant="link" @click="back">Back</AppButton>
<AppButton :loading="isSaving" :disabled="!isValid" @click="submit">Submit</AppButton>
```

### AppListSection + AppListRow

```vue
<AppListSection title="Account">
  <AppListRow label="Edit Profile" hint="Name, photo" icon="person" icon-bg="#0a84ff"
    @click="router.push({ name: 'settings-account-edit' })" />
  <AppListDivider />
  <AppListRow label="Delete Account" icon="delete_forever" :danger="true"
    @click="router.push({ name: 'settings-account-delete' })" />
</AppListSection>
```

### Headless composables

```typescript
import { useBottomSheet, useDrawer } from '@synkos/ui';

const sheet = useBottomSheet();
// sheet.isOpen — reactive boolean
// sheet.open() / close() / toggle()
// <AppBottomSheet v-bind="sheet.bindings">...</AppBottomSheet>
```

### AppPageLargeTitle

```vue
<AppPageLargeTitle title="Dashboard" subtitle="Your activity this week">
  <template #right>
    <button @click="openFilters">Filter</button>
  </template>
</AppPageLargeTitle>
```

---

## 17. Feature flags

### Framework flags

| Flag                | Effect when `false`                          |
| ------------------- | -------------------------------------------- |
| `googleAuth`        | Hides Google sign-in button                  |
| `appleAuth`         | Hides Apple sign-in button                   |
| `faceId`            | Never prompts Face ID, skips biometric check |
| `guestMode`         | Hides "Continue without account" button      |
| `pushNotifications` | Skips push notification initialization       |

### Custom flags

```typescript
// src/app.config.ts (extend the type)
declare module 'synkos' {
  interface AppConfigFeatures {
    premiumContent: boolean;
    betaFeatures: boolean;
  }
}

features: {
  // ... framework flags
  premiumContent: false,
  betaFeatures: process.env.NODE_ENV !== 'production',
}
```

Use anywhere:

```typescript
import { getClientConfig } from '@synkos/client';

const { features } = getClientConfig();
if (features.premiumContent) { ... }
```

---

## Quick reference

### What to edit for a new app

| Task                       | File                                 |
| -------------------------- | ------------------------------------ |
| App name, bundle ID, links | `src/app.config.ts`                  |
| Your features              | `src/features/`                      |
| Your tabs                  | `src/router/index.ts` (meta.tab)     |
| Your translations          | `src/i18n/en-US/`, `src/i18n/es-ES/` |
| Brand colors               | `src/css/dark.theme.scss`            |
| SCSS design tokens         | `src/css/quasar.variables.scss`      |
| Auth page look             | `src/pages/auth/LoginPage.vue`       |
| Billing integration        | `src/pages/settings/billing/`        |
| Legal documents            | `src/pages/settings/legal/`          |
| API URL                    | `.env` → `VITE_API_URL`              |
| Boot hooks                 | `src/boot/synkos.ts`                 |

### Key imports from `@synkos/client`

```typescript
// Auth
import { useAuthStore } from '@synkos/client';

// Settings
import { useSettingsStore, useSettings } from '@synkos/client';

// API + services
import {
  getApiClient,
  AuthService,
  UserService,
  AccountService,
  UsernameService,
} from '@synkos/client';
import { notificationsService } from '@synkos/client';

// Composables
import {
  useSignOut,
  usePullToRefresh,
  usePlatform,
  useNavAction,
  useNavTitle,
} from '@synkos/client';

// Config (in user-owned pages)
import { getClientConfig } from '@synkos/client';

// Components
import { LegalBottomSheet, MainLayout, AuthLayout, SynkosApp } from '@synkos/client';

// Router
import { createSynkosRouter, setupSynkosRouter, synkosSettingsRoutes } from '@synkos/client';

// Types
import type { AppTabRoute, TabMeta, PublicUser, SettingsConfig } from '@synkos/client';
```
