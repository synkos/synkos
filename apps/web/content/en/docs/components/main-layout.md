---
title: MainLayout
description: "Main app layout — iOS-style nav bar at the top, tab bar at the bottom, and\na scrollable page area in between. Use it as the `component` of the parent\nroute under `/`. Tabs are auto-discovered from `meta.tab` on child routes\n(see the [routing guide](/docs/guide/routing)).\n\nThe layout provides the `synkos:set-nav-title` inject token so\n`AppPageLargeTitle` can crossfade collapsed titles into the nav bar."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Main app layout — iOS-style nav bar at the top, tab bar at the bottom, and
a scrollable page area in between. Use it as the `component` of the parent
route under `/`. Tabs are auto-discovered from `meta.tab` on child routes
(see the [routing guide](/docs/guide/routing)).

The layout provides the `synkos:set-nav-title` inject token so
`AppPageLargeTitle` can crossfade collapsed titles into the nav bar.

## Usage

```ts
import { MainLayout, setupSynkosRouter } from '@synkos/client'

createRouter({
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: '', meta: { tab: { icon: 'home', labelKey: 'tabs.home' } }, component: HomePage },
        ...
      ],
    },
  ],
})
```
