---
title: AppBottomSheet
description: "Modal sheet that slides up from the bottom edge. Pair with `useBottomSheet()`\nfor the easiest two-way binding. The component itself is unstyled — pass a\ncard surface inside the slot for the visible body."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Modal sheet that slides up from the bottom edge. Pair with `useBottomSheet()`
for the easiest two-way binding. The component itself is unstyled — pass a
card surface inside the slot for the visible body.

## Preview

<ClientOnly>

::AppBottomSheetDemo
::

</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { AppBottomSheet, useBottomSheet } from '@synkos/ui'
const sheet = useBottomSheet()
<\/script>

<template>
  <AppButton @click="sheet.open">Open sheet</AppButton>
  <AppBottomSheet v-bind="sheet.bindings">
    <div class="my-sheet"> ... </div>
  </AppBottomSheet>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Visibility of the sheet. Use with `v-model` or via `useBottomSheet()`. |
| `seamless` | `boolean` | `false` | Hide the dimmed backdrop and pass pointer events to underlying UI. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Fired when the user dismisses the sheet (backdrop tap, Escape key). |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | Sheet body. Render your card surface and content here. |
