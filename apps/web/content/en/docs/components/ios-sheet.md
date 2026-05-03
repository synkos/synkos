---
title: IOSSheet
description: "Modal sheet that emulates the native iOS 15+ \"sheet presentation\" — slides\nup from the bottom over a dimmed, blurred backdrop, with an optional drag\nhandle, drag-to-dismiss gesture, and a built-in iOS-style header (cancel\nleft, title centered, confirm right).\n\nUse this over `AppBottomSheet` when you need a richer overlay: titled\npicker, multi-step form, multi-select list. For lightweight, unstyled\noverlays (e.g. tooltips, custom action menus), prefer `AppBottomSheet`."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Modal sheet that emulates the native iOS 15+ "sheet presentation" — slides
up from the bottom over a dimmed, blurred backdrop, with an optional drag
handle, drag-to-dismiss gesture, and a built-in iOS-style header (cancel
left, title centered, confirm right).

Use this over `AppBottomSheet` when you need a richer overlay: titled
picker, multi-step form, multi-select list. For lightweight, unstyled
overlays (e.g. tooltips, custom action menus), prefer `AppBottomSheet`.

## Preview

<ClientOnly>

::IOSSheetDemo
::

</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { IOSSheet, useBottomSheet } from '@synkos/ui'
const sheet = useBottomSheet()
<\/script>

<template>
  <IOSSheet
    v-bind="sheet.bindings"
    title="Pick a repo"
    dismiss-label="Cancel"
    confirm-label="Import"
    :confirm-disabled="!selected"
    @confirm="doImport"
  >
    <template #belowHeader>
      <input v-model="q" placeholder="Search…" />
    </template>
    <ul> ... </ul>
  </IOSSheet>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Visibility of the sheet. Use with `v-model` or via `useBottomSheet()`. |
| `title` | `string` | — | Optional title rendered centered in the built-in header. |
| `dismissLabel` | `string` | — | Label for the leading (left) header button. Omit to hide. |
| `confirmLabel` | `string` | — | Label for the trailing (right) header button. Omit to hide. |
| `confirmDisabled` | `boolean` | `false` | When true, the trailing action is dimmed and ignores taps. |
| `confirmLoading` | `boolean` | `false` | When true, the trailing action shows a spinner instead of its label. |
| `detent` | `"medium" \| "large"` | `'large'` | Sheet height. `medium` is roughly half-screen; `large` near full. |
| `dragHandle` | `boolean` | `true` | Show the small grabber handle at the top. Defaults to true. |
| `dragToDismiss` | `boolean` | `true` | Allow swiping the sheet down to dismiss. Defaults to true. |
| `backdropBlur` | `boolean` | `true` | Apply a blurred backdrop in addition to the dim overlay. |
| `seamless` | `boolean` | `false` | Hide backdrop and let pointer events fall through empty space. |
| `backdropDismiss` | `boolean` | `true` | Allow tapping the backdrop to close. Defaults to true. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Fired with the new value on every visibility change. |
| `dismiss` | — | Fired when the user taps the leading button or backdrop. |
| `confirm` | — | Fired when the user taps the trailing (confirm) button. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `header` | — | Replaces the entire built-in header (handle + title + actions). |
| `belowHeader` | — | Sticky region directly below the header — ideal for a search bar. |
| `default` | — | Sheet body (scrollable). |
| `footer` | — | Sticky bottom region — ideal for a primary action / toolbar. |
