---
title: OtpInput
description: "6-digit (configurable) OTP input. Auto-advances on type, supports paste of\nthe whole code, accepts only digits, and emits `complete` when every cell\nis filled. Toggle the `shake` prop to play an error animation.\n\nThe `modelValue` is an array of single-digit strings — one per cell —\nfor easy two-way binding with reactive cells."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

6-digit (configurable) OTP input. Auto-advances on type, supports paste of
the whole code, accepts only digits, and emits `complete` when every cell
is filled. Toggle the `shake` prop to play an error animation.

The `modelValue` is an array of single-digit strings — one per cell —
for easy two-way binding with reactive cells.

## Preview

<ClientOnly>

::OtpInputDemo
::

</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OtpInput } from '@synkos/client'

const code = ref<string[]>(Array(6).fill(''))
const error = ref(false)
const shake = ref(false)

function onComplete() {
  // submit code.value.join('')
}
<\/script>

<template>
  <OtpInput v-model="code" :error="error" :shake="shake" @complete="onComplete" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `string[]` | — | Array of digit strings. Length matches `length`. |
| `length` | `number` | `6` | Number of digit cells. Defaults to 6. |
| `error` | `boolean` | — | Apply the error styling (red border, error background). |
| `shake` | `boolean` | — | Trigger the shake animation once. Set back to false in `shakeEnd`. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `Array` | Fired on every change. The new array is passed. |
| `complete` | — | Fired when the user has filled every cell. |
| `shakeEnd` | — | Fired when the shake animation ends (use to reset the `shake` prop). |
