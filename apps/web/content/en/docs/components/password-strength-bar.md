---
title: PasswordStrengthBar
description: "Visual feedback for password strength — a colored bar plus a textual label.\nDrive it from the `usePasswordStrength()` composable, which evaluates the\npassword and exposes both the level and the percentage you pass in here."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Visual feedback for password strength — a colored bar plus a textual label.
Drive it from the `usePasswordStrength()` composable, which evaluates the
password and exposes both the level and the percentage you pass in here.

## Preview

<ClientOnly>

::PasswordStrengthBarDemo
::

</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { PasswordStrengthBar, usePasswordStrength } from '@synkos/client'

const password = ref('')
const strength = usePasswordStrength(password)
<\/script>

<template>
  <input v-model="password" type="password" />
  <PasswordStrengthBar :level="strength.level" :pct="strength.pct" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `level` _(required)_ | `StrengthLevel \| null` | — | Strength level, or `null` while no password has been entered. |
| `pct` _(required)_ | `number` | — | Width of the colored bar as a percentage (0-100). |
| `labels` | `Record` | `() => ({ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' })` | Override the default labels per level (i18n). |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | `{ level, pct }` | Override the label rendering. Receives `{ level, pct }`. |
