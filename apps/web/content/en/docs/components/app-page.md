---
title: AppPage
description: "Page wrapper that fills its container with the active theme's background\nand owns the page's vertical scroll. Each `AppPage` has its own scroll\nposition, so a tab cached via `<keep-alive>` keeps its scroll across\nnavigations — matching iOS `UITabBarController` behaviour.\n\nUse it as the root of your page components so they pick up the surface\ncolor, full-height layout and per-page scroll consistently. When mounted\ninside Synkos's `MainLayout`, re-tapping the active tab triggers a smooth\nscroll-to-top via an injected signal."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Page wrapper that fills its container with the active theme's background
and owns the page's vertical scroll. Each `AppPage` has its own scroll
position, so a tab cached via `<keep-alive>` keeps its scroll across
navigations — matching iOS `UITabBarController` behaviour.

Use it as the root of your page components so they pick up the surface
color, full-height layout and per-page scroll consistently. When mounted
inside Synkos's `MainLayout`, re-tapping the active tab triggers a smooth
scroll-to-top via an injected signal.

## Usage

```vue
<template>
  <AppPage>
    <AppPageLargeTitle title="Inbox" />
    <!-- page content -->
  </AppPage>
</template>
```

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | Page content. |
