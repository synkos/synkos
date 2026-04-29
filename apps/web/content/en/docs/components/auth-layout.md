---
title: AuthLayout
description: "Layout for `/auth/*` routes — a thin wrapper around `<router-view>` that\nholds the auth chrome boundary. Routes nested under it skip the main app's\nnav and tab bars. Used together with `MainLayout` and Synkos's auth guard,\nwhich redirects unauthenticated users here."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Layout for `/auth/*` routes — a thin wrapper around `<router-view>` that
holds the auth chrome boundary. Routes nested under it skip the main app's
nav and tab bars. Used together with `MainLayout` and Synkos's auth guard,
which redirects unauthenticated users here.

## Usage

```ts
import { AuthLayout } from '@synkos/client'

createRouter({
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'login', meta: { requiresAuth: false }, component: LoginPage },
        { path: 'username', meta: { requiresAuth: false }, component: UsernamePage },
      ],
    },
  ],
})
```
