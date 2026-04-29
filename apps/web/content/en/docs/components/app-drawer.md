---
title: AppDrawer
description: "Side drawer that slides in from the right edge. Pair with `useDrawer()` for\nthe easiest two-way binding. Renders teleported to `<body>` and dismisses\non backdrop tap."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Side drawer that slides in from the right edge. Pair with `useDrawer()` for
the easiest two-way binding. Renders teleported to `<body>` and dismisses
on backdrop tap.

## Preview

<ClientOnly>

::AppDrawerDemo
::

</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { AppDrawer, useDrawer } from '@synkos/ui'
const menu = useDrawer()
<\/script>

<template>
  <AppButton variant="ghost" @click="menu.open">Menu</AppButton>
  <AppDrawer v-bind="menu.bindings">
    <nav class="my-drawer"> ... </nav>
  </AppDrawer>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Drawer visibility. Use `v-model` or `useDrawer()`. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Fired when the user dismisses the drawer (backdrop tap). |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | Drawer panel content. |
