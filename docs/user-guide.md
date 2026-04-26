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
9. [Boot files](#9-boot-files)
10. [Auth extensions](#10-auth-extensions)
11. [Making API calls](#11-making-api-calls)
12. [Native features](#12-native-features)
13. [UI Components (`@synkos/ui`)](#13-ui-components-synkosui)
14. [Backend integration](#14-backend-integration)
15. [Feature flags](#15-feature-flags)

---

## 1. What is Synkos?

Synkos is a fullstack framework for building mobile and web apps with Vue 3 + Quasar (frontend) and Node + Express (backend). When you run `pnpm create synkos`, you get a complete, ready-to-run project with:

- **Authentication** — Email, Google, Apple Sign In, email verification, password reset, Face ID
- **Settings** — Account management, preferences, notifications, security, billing, support, legal, about
- **Profile** — User profile, avatar upload, username, sign-out
- **Navigation** — iOS-style tab bar, nav bar with back buttons, page transitions
- **Backend** — REST API, JWT auth, MongoDB, push notifications, adapters for email/storage/queue

Everything is pre-wired. You start by adding your features, not by building infrastructure.

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

> For iOS development, use `pnpm dev:ios` instead of `pnpm dev`. This runs the Capacitor iOS build with the correct Xcode settings.

---

## 3. Project structure

After scaffolding, the frontend project looks like this:

```
my-app/frontend/src/
│
├── app.config.ts          ← The only file you MUST edit to start
│
├── boot/
│   ├── auth.ts            ← Initializes auth + API client
│   ├── i18n.ts            ← Loads translations
│   ├── notifications.ts   ← Sets up push notifications
│   └── splash.ts          ← Hides the native splash screen
│
├── features/
│   └── home/              ← Your app code goes here
│       └── pages/
│           └── HomePage.vue
│
├── router/
│   └── routes/
│       ├── app.routes.ts  ← Your tabs and routes (edit this)
│       ├── core.routes.ts ← Auth + profile (do not modify)
│       └── settings.routes.ts  ← Settings (do not modify)
│
├── i18n/
│   ├── en-US/index.ts     ← Your English strings
│   └── es-ES/index.ts     ← Your Spanish strings
│
└── css/
    ├── app.scss           ← Global styles + Quasar overrides
    └── quasar.variables.scss  ← Design tokens (colors, spacing, fonts)
```

**The rule:** everything in `features/` is yours. Everything else is framework infrastructure that you customize via configuration, not by editing directly.

---

## 4. Configuration (`app.config.ts`)

This is the first file you edit. It's the single source of truth for your app's identity.

```typescript
// src/app.config.ts
import { defineAppConfig } from 'synkos';

export const appConfig = defineAppConfig({
  // ── Identity ────────────────────────────────────────────────────────────────
  name: 'My App', // Shown in the UI (nav bar, login screen, about)
  version: '1.0.0', // Shown in Settings → About
  bundleId: 'com.mycompany.myapp', // Must match capacitor.config.json

  // ── Company ─────────────────────────────────────────────────────────────────
  company: {
    name: 'My Company',
    legalName: 'My Company, Inc.',
    country: 'US',
    jurisdiction: 'Delaware',
  },

  // ── Storage keys ─────────────────────────────────────────────────────────────
  // Change these so multiple apps on the same device don't share data.
  storageKeys: {
    settings: 'myapp-settings',
    pushToken: 'myapp-push-token',
    pushTokenRegistered: 'myapp-push-token-registered',
  },

  // ── Feature flags ─────────────────────────────────────────────────────────
  features: {
    googleAuth: true, // Show Google sign-in button
    appleAuth: true, // Show Apple sign-in button (iOS only)
    faceId: true, // Offer Face ID after first login
    guestMode: false, // Allow using the app without an account
    pushNotifications: true, // Enable APNs/FCM push notifications
  },

  // ── Links ───────────────────────────────────────────────────────────────────
  links: {
    website: 'https://myapp.com',
    contactEmail: 'legal@myapp.com',
    supportEmail: 'support@myapp.com',
    privacyPolicy: 'https://myapp.com/privacy',
    termsOfService: 'https://myapp.com/terms',
    appStore: {
      ios: '', // Fill in after publishing to App Store
      android: '', // Fill in after publishing to Google Play
    },
    community: '', // Discord, Reddit, etc. (optional)
  },

  // ── Native / Capacitor ──────────────────────────────────────────────────────
  native: {
    ios: {
      contentInset: 'never', // 'never' | 'automatic' | 'scrollable'
    },
    splashScreen: {
      backgroundColor: '#000000',
      showSpinner: false,
      fadeOutDuration: 250,
    },
    pushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
});
```

That's all you need to get a running, branded app. The auth flow, settings, profile, and navigation will all use these values automatically.

### Adding custom feature flags

Use TypeScript module augmentation to add type-safe flags:

```typescript
// src/app.config.ts

// Extend the feature flags type
declare module 'synkos' {
  interface AppConfigFeatures {
    premiumContent: boolean;
    betaFeatures: boolean;
  }
}

export const appConfig = defineAppConfig({
  // ...
  features: {
    googleAuth: true,
    appleAuth: true,
    faceId: true,
    guestMode: false,
    pushNotifications: true,
    // Your custom flags — TypeScript knows about them
    premiumContent: false,
    betaFeatures: false,
  },
});
```

Then use them anywhere:

```typescript
import { useAppConfig } from 'synkos';

const config = useAppConfig();
if (config.features.premiumContent) {
  // show premium content
}
```

---

## 5. Your first feature

A feature is a folder in `src/features/` with pages, and optionally components and composables.

### Step 1 — Create the page

```
src/features/
  dashboard/
    pages/
      DashboardPage.vue
```

```vue
<!-- src/features/dashboard/pages/DashboardPage.vue -->
<template>
  <q-page class="dashboard-page">
    <h1>{{ t('pages.dashboard.title') }}</h1>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>
```

### Step 2 — Register the route

```typescript
// src/router/routes/app.routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const appTabRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('src/features/home/pages/HomePage.vue'),
  },
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('src/features/dashboard/pages/DashboardPage.vue'),
  },
];
```

### Step 3 — Add the tab to the tab bar

Edit `src/core/layouts/MainLayout.vue` to add a tab:

```typescript
const tabs = computed(() => [
  { path: '/', label: t('tabs.home'), icon: 'home' },
  { path: '/dashboard', label: t('tabs.dashboard'), icon: 'dashboard' },
  { path: '/profile', label: t('tabs.profile'), icon: 'person' },
]);
```

### Step 4 — Add the translations

```typescript
// src/i18n/en-US/index.ts
export default {
  tabs: {
    home: 'Home',
    dashboard: 'Dashboard', // ← add this
    profile: 'Profile',
  },
  pages: {
    dashboard: {
      title: 'Dashboard',
    },
    // ...
  },
};
```

### Step 5 — (Optional) Cache the tab

If your page fetches data on mount, add it to `cachedViews` in `MainLayout.vue` to avoid re-fetching on every tab switch:

```typescript
const cachedViews = ['HomePage', 'DashboardPage'];
```

---

## 6. Routing

### Route types

There are three types of routes:

| Type                   | Layout                           | Used for                          |
| ---------------------- | -------------------------------- | --------------------------------- |
| **Tab routes**         | `MainLayout` (nav bar + tab bar) | Main feature screens              |
| **Full-screen routes** | `AuthLayout` (no chrome)         | Camera, onboarding, games         |
| **Settings routes**    | `MainLayout`                     | Already provided by the framework |

### Adding a full-screen route

Full-screen routes use `AuthLayout` so there's no tab bar or nav bar. Good for camera, scanner, onboarding:

```typescript
// src/router/routes/app.routes.ts
export const appFullscreen: RouteRecordRaw = {
  path: '/app',
  component: () => import('src/core/layouts/AuthLayout.vue'),
  children: [
    {
      path: 'camera',
      name: 'camera',
      component: () => import('src/features/camera/pages/CameraPage.vue'),
    },
  ],
};
```

Then in `src/router/routes/index.ts`, include it:

```typescript
const routes = [
  coreAuthRoute,
  appFullscreen, // ← add this
  {
    path: '/',
    component: () => import('src/core/layouts/MainLayout.vue'),
    children: [...appTabRoutes, coreProfileRoute, ...coreSettingsRoutes],
  },
  { path: '/:catchAll(.*)*', component: () => import('src/pages/ErrorNotFound.vue') },
];
```

### Navigation

Always navigate by route name, never by path:

```typescript
import { useRouter } from 'vue-router';

const router = useRouter();

// ✅ correct
router.push({ name: 'dashboard' });
router.push({ name: 'product-detail', params: { id: '123' } });

// ❌ avoid
router.push('/dashboard');
```

### Protected routes

Routes inside `MainLayout` require authentication by default. The global guard redirects unauthenticated users to `auth-login` automatically.

To protect specific routes from guest users (i.e., require a real account):

```typescript
{
  path: 'checkout',
  name: 'checkout',
  meta: { requiresAuth: true },  // guests cannot access this
  component: () => import('...'),
}
```

### Nav bar titles

The iOS nav bar title and back button label are driven by i18n keys in route `meta`:

```typescript
{
  path: 'product/:id',
  name: 'product-detail',
  meta: {
    titleKey: 'pages.product.title',        // i18n key → "Product"
    parentTitleKey: 'pages.catalog.title',  // back button label → "Catalog"
  },
  component: () => import('...'),
}
```

---

## 7. Internationalization (i18n)

### App-specific strings

Your strings live in `src/i18n/en-US/index.ts` and `src/i18n/es-ES/index.ts`. These are merged at boot time with the framework's core strings (auth, settings, profile, navigation).

```typescript
// src/i18n/en-US/index.ts
export default {
  tabs: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
  },
  pages: {
    home: {
      title: 'Welcome',
      subtitle: 'Everything you need.',
    },
    dashboard: {
      title: 'Dashboard',
      empty: 'No data yet.',
      loadError: 'Could not load data. Try again.',
    },
  },
};
```

### Using translations in components

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
  <h1>{{ t('pages.dashboard.title') }}</h1>
  <p>{{ t('pages.dashboard.empty') }}</p>
</template>
```

### Pluralization

```typescript
// i18n
items: '{count} item | {count} items';

// template
t('pages.cart.items', { count: itemCount }, itemCount);
// → "1 item" or "3 items"
```

### Adding a new language

1. Create `src/i18n/fr-FR/index.ts` with your French strings
2. Pass it to `createI18nBoot` in `src/boot/i18n.ts`:

```typescript
// src/boot/i18n.ts
import frFR from 'src/i18n/fr-FR';

export default defineBoot(
  createI18nBoot({
    messages: {
      'en-US': enUS,
      'es-ES': esES,
      'fr-FR': frFR, // ← add this
    },
  })
);
```

3. Add the language label in your i18n files:

```typescript
// en-US
settings: {
  languages: {
    'en-US': 'English',
    'es-ES': 'Español',
    'fr-FR': 'Français',  // ← add this
  },
}
```

---

## 8. Styling and theming

### Design tokens

The entire visual language is defined in `src/css/quasar.variables.scss`. These SCSS variables are automatically available in every Vue component's `<style lang="scss">` block — no imports needed.

**Key tokens:**

```scss
// Colors
$primary: #0a84ff; // iOS blue — main actions, links
$secondary: #30d158; // iOS green — success states
$negative: #ff453a; // iOS red — errors, destructive actions
$warning: #ffd60a; // iOS yellow — warnings

// Surfaces (layered transparency over dark background)
$surface-1: rgba(255, 255, 255, 0.05); // subtle cards
$surface-2: rgba(255, 255, 255, 0.06); // list groups
$surface-press: rgba(255, 255, 255, 0.04); // tap state

// Glass morphism (nav bar, tab bar, sheets)
$glass-bg: rgba(28, 28, 30, 0.82);
$glass-blur: saturate(180%) blur(20px);
$glass-border: rgba(255, 255, 255, 0.12);

// Text hierarchy
$text-primary: rgba(255, 255, 255, 0.95); // headings
$text-secondary: rgba(255, 255, 255, 0.9); // body
$text-muted: rgba(255, 255, 255, 0.75); // secondary
$text-label: rgba(235, 235, 245, 0.45); // section headers

// Typography
$font-body: 15px; // primary body text
$font-body-lg: 17px; // nav bar, inputs
$font-display: 34px; // large page titles
$font-caption: 12px; // hints, section headers

// Spacing (4-based grid)
$space-4: 8px;
$space-8: 16px;
$space-12: 24px;
$space-16: 32px;

// Border radius
$radius-xl: 14px; // buttons, list groups
$radius-2xl: 16px; // cards
$radius-full: 9999px; // pills, avatars

// Transitions
$transition-quick: 0.15s ease;
$transition-spring: 0.32s cubic-bezier(0.36, 0.66, 0.04, 1);
```

### Customizing your brand

Change the primary color, fonts, and surfaces in `quasar.variables.scss`:

```scss
// src/css/quasar.variables.scss

// Brand color — changes buttons, links, active states, and Quasar components
$primary: #6750a4; // Purple

// Accent color
$accent: #ff6b35;

// Page background (typically pure black for OLED)
$dark-page: #0a0a0a;

// Optionally change the glass chrome background
$glass-bg: rgba(20, 16, 28, 0.85); // Slightly purple-tinted glass
```

### Writing component styles

Use SCSS variables from the token system instead of hardcoded values:

```vue
<style scoped lang="scss">
// ✅ Use tokens
.card {
  background: $surface-2;
  border: 0.5px solid $surface-2-border;
  border-radius: $radius-2xl;
  padding: $space-8;

  &:active {
    background: $surface-press;
  }
}

.card-title {
  font-size: $font-body-lg;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: $ls-tight;
}

.card-hint {
  font-size: $font-body-sm;
  color: $text-muted;
}

// ❌ Avoid hardcoded values
.card-bad {
  background: rgba(255, 255, 255, 0.06); // what does this mean?
  font-size: 13px; // which size is this?
}
</style>
```

### Glass morphism

For nav bars, bottom sheets, and drawers:

```vue
<style scoped lang="scss">
.my-sheet {
  background: $glass-bg;
  backdrop-filter: $glass-blur-heavy;
  -webkit-backdrop-filter: $glass-blur-heavy; // required for iOS WKWebView
  border-top: 0.5px solid $glass-border;
}
</style>
```

### Global animations

Vue transitions and `@keyframes` used by multiple components go in `src/css/app.scss`:

```scss
// src/css/app.scss

// Shared animation — reference from any component
@keyframes my-spin {
  to {
    transform: rotate(360deg);
  }
}

// Shared Vue transition — <Transition name="slide-up">
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform $transition-spring,
    opacity 0.25s ease;
}
.slide-up-enter-from {
  transform: translateY(24px);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
```

The `.fade-enter-active` / `.fade-leave-active` transition for `<Transition name="fade">` is already defined globally — use it in any component without declaring anything.

---

## 9. Boot files

Boot files are thin wrappers around the framework's initialization logic. They run in order when the app starts.

### `boot/auth.ts`

Initializes the API client and the auth store. Restores the session from the keychain on launch.

```typescript
// src/boot/auth.ts
import { defineBoot } from '#q-app/wrappers';
import { createAuthBoot } from '@synkos/client';
import { appConfig } from 'src/app.config';

export default defineBoot(
  createAuthBoot({
    config: appConfig,
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',

    // Optional lifecycle hooks (see §10 — Auth Extensions)
    onLogin: (user) => {
      console.log('User logged in:', user.id);
    },
    onLogout: () => {
      console.log('User logged out');
    },
  })
);
```

### `boot/i18n.ts`

Creates the vue-i18n instance, merges your strings with the framework's core strings, and reads the persisted language from storage.

```typescript
// src/boot/i18n.ts
import { defineBoot } from '#q-app/wrappers';
import { createI18nBoot } from '@synkos/client';
import enUS from 'src/i18n/en-US';
import esES from 'src/i18n/es-ES';

export default defineBoot(
  createI18nBoot({
    messages: { 'en-US': enUS, 'es-ES': esES },
  })
);
```

### `boot/notifications.ts`

Requests push permission on launch and sets up handlers for foreground notifications and notification taps.

```typescript
// src/boot/notifications.ts
import { defineBoot } from '#q-app/wrappers';
import { createNotificationsBoot } from '@synkos/client';

export default defineBoot(
  createNotificationsBoot({
    // Called when a notification arrives while the app is open
    onNotification: (notification) => {
      console.log('Foreground notification:', notification.title);
      // Show an in-app banner here if desired
    },

    // Called when the user taps a notification
    onActionPerformed: (action) => {
      const data = action.notification.data as { screen?: string };
      if (data.screen) {
        // router is not directly available here — use a global event or store
        console.log('Navigate to:', data.screen);
      }
    },
  })
);
```

The default `onActionPerformed` handler reads `notification.data.screen`, `notification.data.params`, and `notification.data.query` and navigates using `router.push()`. Override it only if you need custom behavior.

### `boot/splash.ts`

Hides the native splash screen after the app has initialized. Must run last.

```typescript
// src/boot/splash.ts — usually no changes needed
import { defineBoot } from '#q-app/wrappers';
import { createSplashBoot } from '@synkos/client';

export default defineBoot(createSplashBoot());
```

### Boot order

The order is defined in `quasar.config.ts`:

```typescript
// quasar.config.ts
boot: ['i18n', 'auth', 'notifications', 'splash'],
```

`i18n` must run before `auth` (the auth store reads the current locale). `splash` must run last.

---

## 10. Auth extensions

### Reacting to login and logout

Pass hooks to `createAuthBoot`:

```typescript
// src/boot/auth.ts
createAuthBoot({
  config: appConfig,
  apiBaseUrl: import.meta.env.VITE_API_URL,

  onLogin: (user) => {
    // Track the user in your analytics service
    analytics.identify(user.id, {
      email: user.email,
      name: user.displayName,
    });
  },

  onLogout: () => {
    analytics.reset();
    // Clear any cached data from your stores
  },
}),
```

### Reading auth state

The `useAuthStore` composable gives you the full session state:

```typescript
import { useAuthStore } from '@synkos/client';

const authStore = useAuthStore();

// Reactive state
authStore.user; // PublicUser | null
authStore.isAuthenticated; // boolean
authStore.isGuest; // boolean
authStore.isLoading; // boolean (during login/logout)
authStore.isPendingDeletion; // boolean

// Actions
await authStore.loginEmail({ email, password });
await authStore.loginGoogle({ idToken });
await authStore.loginApple({ idToken });
await authStore.logout();
await authStore.register({ email, password });

// Profile updates
await authStore.updateName('Jane Doe');
await authStore.updatePhoto(file);
await authStore.removePhoto();
await authStore.changePassword(currentPassword, newPassword);
await authStore.setUsername('jane_doe');
await authStore.changeUsername('new_username');
```

### User type

```typescript
interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: string;
  providers: string[]; // ['email', 'google', 'apple']
  deletionStatus: 'active' | 'pending_deletion';
  deletionScheduledAt?: string;
}
```

### Protecting a component from guests

```vue
<template>
  <div v-if="authStore.isAuthenticated && !authStore.isGuest">
    <!-- authenticated-only content -->
  </div>
  <div v-else>
    <button @click="router.push({ name: 'auth-login' })">Sign in</button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@synkos/client';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
</script>
```

---

## 11. Making API calls

### The API client

The API client (`axios` with token injection and 401 retry) is initialized by `createAuthBoot`. Access it via the service layer:

```typescript
import { getApiClient } from '@synkos/client';

const api = getApiClient();
const response = await api.get('/my-endpoint');
```

The client automatically:

- Injects the `Authorization: Bearer {token}` header
- Silently refreshes the token on 401 and retries the request
- Calls `logout()` if the refresh also fails

### Creating a service

Services are plain objects with async methods. Group them by domain:

```typescript
// src/services/products.service.ts
import { getApiClient } from '@synkos/client';

interface Product {
  id: string;
  name: string;
  price: number;
}

export const ProductsService = {
  async list(): Promise<Product[]> {
    const res = await getApiClient().get<{ success: boolean; data: Product[] }>('/products');
    return res.data.data;
  },

  async getById(id: string): Promise<Product> {
    const res = await getApiClient().get<{ success: boolean; data: Product }>(`/products/${id}`);
    return res.data.data;
  },

  async create(payload: Omit<Product, 'id'>): Promise<Product> {
    const res = await getApiClient().post<{ success: boolean; data: Product }>(
      '/products',
      payload
    );
    return res.data.data;
  },

  async update(id: string, payload: Partial<Product>): Promise<Product> {
    const res = await getApiClient().patch<{ success: boolean; data: Product }>(
      `/products/${id}`,
      payload
    );
    return res.data.data;
  },

  async delete(id: string): Promise<void> {
    await getApiClient().delete(`/products/${id}`);
  },
};
```

### Creating a Pinia store

```typescript
// src/stores/products.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ProductsService } from 'src/services/products.service';

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    isLoading.value = true;
    error.value = null;
    try {
      products.value = await ProductsService.list();
    } catch {
      error.value = 'Could not load products.';
    } finally {
      isLoading.value = false;
    }
  }

  return { products, isLoading, error, fetchAll };
});
```

### Using the store in a component

```vue
<template>
  <q-page>
    <div v-if="store.isLoading">Loading...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <ul v-else>
      <li v-for="product in store.products" :key="product.id">
        {{ product.name }} — ${{ product.price }}
      </li>
    </ul>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductsStore } from 'src/stores/products.store';

const store = useProductsStore();
onMounted(() => store.fetchAll());
</script>
```

### Environment variables

The API base URL is configured in `.env`:

```env
# .env (never commit this file)
VITE_API_URL=http://localhost:3001/api/v1
```

For production, set `VITE_API_URL` to your deployed API URL.

---

## 12. Native features

### Push notifications

Push is handled automatically. When the user grants permission, the token is registered with your backend. You only need to configure the handlers in `boot/notifications.ts` (see §9).

#### Sending a push from your backend

Structure the APNs payload's `data` field like this and the framework's default handler will navigate automatically:

```json
{
  "notification": {
    "title": "New message",
    "body": "You have a new message from Jane"
  },
  "data": {
    "screen": "message-detail",
    "params": { "id": "msg_123" },
    "query": { "highlight": "true" }
  }
}
```

The app navigates to `router.push({ name: 'message-detail', params: { id: 'msg_123' }, query: { highlight: 'true' } })`.

#### Checking permission status

```typescript
import { notificationsService } from '@synkos/client';

const status = await notificationsService.checkPermissionStatus();
// 'granted' | 'denied' | 'prompt' | 'unavailable'
```

### Face ID / Touch ID

Face ID is handled entirely by the framework. After the first successful login, if the device supports biometrics and the user hasn't been asked yet, the login screen shows a Face ID prompt.

To check if biometrics are enabled:

```typescript
import { useAuthStore } from '@synkos/client';
const authStore = useAuthStore();
authStore.biometricEnabled; // boolean
```

### Detecting the platform

```typescript
import { Capacitor } from '@capacitor/core';

Capacitor.isNativePlatform(); // true on iOS/Android
Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
Capacitor.isPluginAvailable('Name'); // check specific plugin
```

### Haptic feedback

```typescript
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// On button taps
await Haptics.impact({ style: ImpactStyle.Light });
await Haptics.impact({ style: ImpactStyle.Medium });
await Haptics.impact({ style: ImpactStyle.Heavy });

// On success / error
await Haptics.notification({ type: NotificationType.Success });
await Haptics.notification({ type: NotificationType.Error });
await Haptics.notification({ type: NotificationType.Warning });
```

Always wrap haptics in `.catch(() => undefined)` — they throw on web where they're unavailable.

### Pull-to-refresh

Use the `usePullToRefresh` composable for iOS-style pull-to-refresh:

```vue
<template>
  <q-page>
    <div :style="wrapperStyle">
      <!-- Pull indicator -->
      <div v-if="pullState !== 'idle'" class="ptr-indicator">
        <q-spinner v-if="pullState === 'refreshing'" size="20px" color="white" />
        <div v-else class="ptr-arrow" :style="arrowStyle">↓</div>
      </div>

      <!-- Content -->
      <div
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchCancel"
      >
        <!-- your list content -->
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { usePullToRefresh } from '@synkos/client';
import { useProductsStore } from 'src/stores/products.store';

const store = useProductsStore();
const {
  pullState,
  wrapperStyle,
  arrowStyle,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
} = usePullToRefresh(() => store.fetchAll());
</script>
```

---

## 13. UI Components (`@synkos/ui`)

Synkos provides a component library with iOS-style primitives. Import them from `@synkos/ui`:

```typescript
import {
  AppButton,
  AppListRow,
  AppListSection,
  AppListDivider,
  AppEmptyState,
  AppPageLargeTitle,
  SegmentControl,
} from '@synkos/ui';
```

### AppButton

```vue
<AppButton @click="save">Save</AppButton>
<AppButton variant="ghost" @click="cancel">Cancel</AppButton>
<AppButton variant="link" @click="goBack">Back</AppButton>
<AppButton :loading="isSaving" :disabled="!isValid" @click="submit">
  Submit
</AppButton>
```

### AppListSection + AppListRow

Used for all settings-style lists:

```vue
<AppListSection title="Account">
  <AppListRow
    label="Edit Profile"
    hint="Name, username, photo"
    icon="person"
    icon-bg="#0a84ff"
    @click="router.push({ name: 'settings-account-edit' })"
  />
  <AppListDivider />
  <AppListRow
    label="Change Password"
    icon="lock"
    icon-bg="#636366"
    @click="router.push({ name: 'settings-account-password' })"
  />
</AppListSection>

<AppListSection title="Danger Zone">
  <AppListRow
    label="Delete Account"
    icon="delete_forever"
    :danger="true"
    @click="router.push({ name: 'settings-account-delete' })"
  />
</AppListSection>
```

### AppEmptyState

```vue
<AppEmptyState
  icon="inbox"
  title="Nothing here yet"
  subtitle="Add your first item to get started."
/>
```

### AppPageLargeTitle

Large title header for pages (like iOS large title navigation):

```vue
<AppPageLargeTitle title="Dashboard" />
```

### SegmentControl

```vue
<SegmentControl
  v-model="activeTab"
  :options="[
    { label: 'List', value: 'list' },
    { label: 'Grid', value: 'grid' },
  ]"
/>
```

---

## 14. Backend integration

If you scaffolded with the backend option, your Express API lives in `my-app/backend/`. It's powered by `@synkos/server` — all auth, user management, and settings endpoints are pre-built.

### Adding a new backend module

Create a module in `src/bootstrap/modules.ts`:

```typescript
// apps/backend/src/bootstrap/modules.ts
import type { ModuleDefinition } from '@synkos/server';
import { Router } from 'express';

const productsRouter = Router();

productsRouter.get('/', async (req, res) => {
  res.json({ success: true, data: [] });
});

productsRouter.post('/', async (req, res) => {
  const { name, price } = req.body;
  // ... create product in database
  res.json({ success: true, data: { id: '123', name, price } });
});

const productsModule: ModuleDefinition = {
  path: '/products',
  router: productsRouter,
  auth: 'required', // 'required' | 'optional' | 'none' | 'mixed'
};

export const modules: ModuleDefinition[] = [productsModule];
```

The module is mounted at `/api/v1/products` automatically.

### Extending the user schema

```typescript
// apps/backend/src/bootstrap/extensions.ts
export function applyExtensions(): void {
  // Add custom fields to the User schema
  import('@synkos/server/modules/auth').then(({ userSchema }) => {
    userSchema.add({
      subscriptionTier: { type: String, enum: ['free', 'pro'], default: 'free' },
      onboardingCompleted: { type: Boolean, default: false },
    });
  });
}
```

### API response format

All Synkos API responses follow this format:

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "RESOURCE_NOT_FOUND", "message": "..." } }
```

Your services should unwrap with `.data.data`:

```typescript
const res = await api.get<{ success: boolean; data: Product[] }>('/products');
return res.data.data; // Product[]
```

---

## 15. Feature flags

Feature flags let you ship code that's hidden behind a config switch — useful for A/B testing, staged rollouts, or simply disabling features per app.

### Framework flags

These flags are built into the UI:

| Flag                | Effect when `false`                        |
| ------------------- | ------------------------------------------ |
| `googleAuth`        | Hides the Google sign-in button            |
| `appleAuth`         | Hides the Apple sign-in button             |
| `faceId`            | Never offers Face ID after login           |
| `guestMode`         | Hides "Enter as guest" on the login screen |
| `pushNotifications` | Skips the entire push setup flow           |

### Custom flags

Add your own flags with full TypeScript support:

```typescript
// src/app.config.ts

declare module 'synkos' {
  interface AppConfigFeatures {
    darkMode: boolean;
    betaFeatures: boolean;
    analyticsEnabled: boolean;
  }
}

export const appConfig = defineAppConfig({
  features: {
    // ... framework flags
    darkMode: true,
    betaFeatures: false,
    analyticsEnabled: process.env.NODE_ENV === 'production',
  },
});
```

Use them in components and composables:

```typescript
import { useAppConfig } from 'synkos';

const { features } = useAppConfig();

if (features.analyticsEnabled) {
  analytics.track('page_view', { page: 'home' });
}
```

Use them in route guards:

```typescript
Router.beforeEach((to) => {
  const { features } = useAppConfig();
  if (to.name === 'beta-feature' && !features.betaFeatures) {
    return { name: 'home' };
  }
});
```

---

## Quick reference

### What to edit for a new app

| Task                       | File                                                 |
| -------------------------- | ---------------------------------------------------- |
| App name, bundle ID, links | `src/app.config.ts`                                  |
| Your features              | `src/features/`                                      |
| Your tabs and routes       | `src/router/routes/app.routes.ts`                    |
| Tab bar labels             | `src/core/layouts/MainLayout.vue` (tabs computed)    |
| Cached tabs                | `src/core/layouts/MainLayout.vue` (cachedViews)      |
| Your translations          | `src/i18n/en-US/index.ts`, `src/i18n/es-ES/index.ts` |
| Colors, fonts              | `src/css/quasar.variables.scss`                      |
| API URL                    | `.env` → `VITE_API_URL`                              |
| Auth hooks                 | `src/boot/auth.ts`                                   |
| Notification handlers      | `src/boot/notifications.ts`                          |

### What NOT to edit

| File/Directory                         | Why                                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| `src/core/`                            | Framework UI — auth, settings, profile, layouts            |
| `src/stores/auth.store.ts`             | Re-exports from `@synkos/client` — logic is in the package |
| `src/stores/settings.store.ts`         | Same                                                       |
| `src/services/*.ts`                    | Same — re-exports from `@synkos/client`                    |
| `src/router/routes/core.routes.ts`     | Core routes — managed by the framework                     |
| `src/router/routes/settings.routes.ts` | Settings routes — managed by the framework                 |

Editing these files is fine for customization, but changes may conflict with future framework updates. When in doubt, extend via configuration rather than direct modification.

### Key imports

```typescript
// Auth state and actions
import { useAuthStore } from '@synkos/client';

// Settings (language, haptics, push)
import { useSettingsStore } from '@synkos/client';

// API client
import { getApiClient } from '@synkos/client';

// Services (pre-built)
import { AuthService, UserService, AccountService, UsernameService } from '@synkos/client';

// Composables
import { useSignOut, usePullToRefresh } from '@synkos/client';

// Push notifications
import { notificationsService } from '@synkos/client';

// App configuration (in Vue components)
import { useAppConfig } from 'synkos';

// UI components
import { AppButton, AppListRow, AppListSection, AppEmptyState } from '@synkos/ui';
```
