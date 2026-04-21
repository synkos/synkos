# synkos

Frontend framework core for Synkos apps — typed app config, Vue plugin, and router guard.

## Install

```bash
pnpm add synkos
```

Peer dependencies: `vue@^3`, `vue-router@^4`

## API

### `defineAppConfig(config)`

Type-safe factory for your app config. Put this in `src/app.config.ts`.

```ts
import { defineAppConfig } from 'synkos';

export const appConfig = defineAppConfig({
  name: 'My App',
  version: '1.0.0',
  bundleId: 'com.company.myapp',
  company: { name: 'My Company', legalName: 'My Company Ltd.', country: 'US', jurisdiction: 'Delaware' },
  storageKeys: {
    settings: 'myapp-settings',
    pushToken: 'myapp-push-token',
    pushTokenRegistered: 'myapp-push-token-registered',
  },
  features: {
    googleAuth: true,
    appleAuth: true,
    faceId: true,
    guestMode: false,
    pushNotifications: true,
  },
  links: {
    website: 'https://example.com',
    contactEmail: 'legal@example.com',
    supportEmail: 'support@example.com',
    privacyPolicy: 'https://example.com/privacy',
    termsOfService: 'https://example.com/terms',
    appStore: { ios: '', android: '' },
    community: '',
  },
  native: {
    ios: { contentInset: 'never' },
    splashScreen: { backgroundColor: '#000000', showSpinner: false, fadeOutDuration: 250 },
    pushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
});
```

### `createSynkosPlugin(config)`

Vue plugin that makes the config available to all components via `useAppConfig()`.

```ts
// src/boot/synkos.ts (Quasar boot file)
import { defineBoot } from '#q-app/wrappers';
import { createSynkosPlugin } from 'synkos';
import { appConfig } from 'src/app.config';

export default defineBoot(({ app }) => {
  app.use(createSynkosPlugin(appConfig));
});
```

### `useAppConfig()`

Composable to access the app config in any component or composable.

```ts
import { useAppConfig } from 'synkos';

const config = useAppConfig();
console.log(config.name); // 'My App'
console.log(config.features.googleAuth); // true
```

### `createAuthGuard(options)`

Factory for a `vue-router` `beforeEach` navigation guard with built-in auth logic.

```ts
// src/router/index.ts
import { defineRouter } from '#q-app/wrappers';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createAuthGuard } from 'synkos';
import routes from './routes';

export default defineRouter(() => {
  const Router = createRouter({
    history: createWebHashHistory(),
    routes,
  });

  Router.beforeEach(createAuthGuard({
    loginRoute: 'auth-login',
    homeRoute: 'home',
    publicRoutes: ['auth-register'],       // optional extra public routes
    getState: async () => {
      const { useAuthStore } = await import('src/stores/auth.store');
      return useAuthStore();               // must expose isAuthenticated, isGuest, isEmailVerified
    },
  }));

  return Router;
});
```

## Types

```ts
import type { AppConfig, AuthGuardOptions, AuthState } from 'synkos';
```
