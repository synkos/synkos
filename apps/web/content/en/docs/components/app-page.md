---
title: AppPage
description: "Page wrapper that fills its container with the active theme's background.\nUse it as the root of your page components so they pick up the surface\ncolor and full-height layout consistently."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Page wrapper that fills its container with the active theme's background.
Use it as the root of your page components so they pick up the surface
color and full-height layout consistently.

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
