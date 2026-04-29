---
title: SynkosApp
description: "Root component of a Synkos app. Wraps the route view with the\nplatform-aware page transitions (slide for tabs, fade for fullscreen flows,\nvertical push for entering/leaving the auth stack), drives the splash\noverlay on native, and applies the active theme via `useTheme()`.\n\nUse it as the root of your `app.vue` (or equivalent). Optionally pass a\nlogo source for the splash overlay shown during native app boot."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Root component of a Synkos app. Wraps the route view with the
platform-aware page transitions (slide for tabs, fade for fullscreen flows,
vertical push for entering/leaving the auth stack), drives the splash
overlay on native, and applies the active theme via `useTheme()`.

Use it as the root of your `app.vue` (or equivalent). Optionally pass a
logo source for the splash overlay shown during native app boot.

## Usage

```vue
<script setup lang="ts">
import { SynkosApp } from '@synkos/client'
import logo from '~/assets/logo.svg'
<\/script>

<template>
  <SynkosApp :logo-src="logo" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `logoSrc` | `string` | — | — |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | — |
