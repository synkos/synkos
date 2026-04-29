---
title: Routing
description: How pages, tabs, layouts and guards fit together in Synkos.
order: 1
---

Synkos uses Vue Router with a small framework on top: a single `setupSynkosRouter` call wires the auth guard, the tab bar, and the dynamic nav bar. You declare your route tree the way you would in any Vue app — Synkos just plugs into it.

## Mental model

- **Layouts** are Vue components you use as the `component` of a parent route. `MainLayout` renders a tab bar at the bottom; `AuthLayout` renders the auth chrome.
- **Tabs** are declared inline on routes via `meta.tab`. `setupSynkosRouter` discovers them by walking `router.getRoutes()`.
- **The auth guard** is registered for you. Routes default to `requiresAuth: true` unless `meta.requiresAuth` says otherwise.
- **Settings routes** are a tree of pages (profile, account, notifications, etc.) you spread into your `MainLayout` children using `synkosSettingsRoutes()`.

## The shape of a Synkos router

```ts
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client';
import { settingsRoutes } from './settings.routes';

export default defineRouter(() => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
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
        ],
      },
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '',
            name: 'home',
            meta: {
              tab: {
                icon: 'home',
                labelKey: 'tabs.home',
                cache: true,
                componentName: 'HomePage',
              },
            },
            component: () => import('src/features/home/pages/HomePage.vue'),
          },
          ...settingsRoutes,
        ],
      },
    ],
  });

  setupSynkosRouter(router);
  return router;
});
```

## Declaring tabs

Tabs are not a separate registration step. Add `meta.tab` to any route under `MainLayout` and Synkos discovers it.

```ts
{
  path: '/discover',
  name: 'discover',
  meta: {
    tab: {
      icon: 'compass',
      labelKey: 'tabs.discover',  // i18n key
      cache: true,                 // keep <KeepAlive> instance
      componentName: 'DiscoverPage',
    },
  },
  component: () => import('src/features/discover/pages/DiscoverPage.vue'),
}
```

| Field           | Type      | Description                                                            |
| --------------- | --------- | ---------------------------------------------------------------------- |
| `icon`          | `string`  | Icon name from `@synkos/ui` icon registry                              |
| `labelKey`      | `string`  | i18n key for the tab label                                             |
| `cache`         | `boolean` | Wrap the route component in `<KeepAlive>`                              |
| `componentName` | `string`  | Component `name` used by `<KeepAlive>` to identify the cached instance |

## Authentication guard

`setupSynkosRouter` registers a `beforeEach` guard that checks `to.meta.requiresAuth`:

- `requiresAuth: false` — public route. Auth pages (`/auth/login`, etc.) **must** set this.
- `requiresAuth: true` (or unset) — requires a session. Unauthenticated users are redirected to `/auth/login`.

You can stack your own guards:

```ts
const router = createRouter({ ... })
setupSynkosRouter(router)

router.beforeEach((to, from) => {
  // Your guard runs after Synkos's auth guard.
  if (to.meta.requiresOnboarding && !user.hasCompletedOnboarding) {
    return { name: 'onboarding' }
  }
})
```

## Settings tree

The settings tree is opinionated but customizable. `synkosSettingsRoutes()` returns the default tree (profile, account, preferences, notifications, security, billing, support, legal, about):

```ts
// src/router/settings.routes.ts
import { synkosSettingsRoutes } from '@synkos/client';

export const settingsRoutes = synkosSettingsRoutes({
  // override individual sections by passing custom components
  billing: { component: () => import('src/pages/settings/billing/MyBilling.vue') },
});
```

Or you can spread it inline and add custom sections in the same children array:

```ts
{
  path: '/',
  component: MainLayout,
  children: [
    ...synkosSettingsRoutes(),
    {
      path: 'workspace',
      component: () => import('src/pages/WorkspacePage.vue'),
    },
  ],
}
```

## Custom layouts

You're not limited to `MainLayout` and `AuthLayout`. Any extra layout is a regular Vue component used as the `component` of a parent route:

```ts
{
  path: '/onboarding',
  component: () => import('src/layouts/OnboardingLayout.vue'),
  children: [
    { path: 'welcome', component: () => import('src/pages/onboarding/Welcome.vue') },
    { path: 'permissions', component: () => import('src/pages/onboarding/Permissions.vue') },
  ],
}
```

Custom layouts are rendered without a tab bar — useful for full-screen flows.

## Dynamic nav bar

Use the navigation composables from inside any page rendered under `MainLayout` to mutate the nav bar:

```ts
import { useNavTitle, useNavAction } from '@synkos/client';

useNavTitle('Inbox (12)');

useNavAction({
  icon: 'plus',
  onClick: () => openCompose(),
});
```

Both auto-clean when the component unmounts, so navigating between pages just works.

## Two router APIs

Synkos exposes two factories:

- **`setupSynkosRouter(router, options?)`** — Quasar-style. You call `createRouter` yourself and pass it in. Recommended.
- **`createSynkosRouter(options)`** — All-in-one. Synkos calls `createRouter` for you given route configs. Simpler, less flexible.

The Quasar-style API gives you full control over `history`, `linkActiveClass`, `scrollBehavior`, and your own `beforeEach` hooks. Prefer it.

## Common patterns

### Programmatic navigation

```ts
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'profile', params: { id: '42' } });
```

### Reading route params

```ts
import { useRoute } from 'vue-router';
const route = useRoute();
const id = computed(() => route.params.id as string);
```

### Redirecting from a page

```ts
const router = useRouter();
onMounted(() => {
  if (!hasRequiredData) router.replace({ name: 'home' });
});
```

## Next steps

- [Authentication](/docs/guide/auth) — how the auth guard knows you're logged in
- [Theming](/docs/guide/theming) — what `MainLayout` and `AuthLayout` use under the hood
