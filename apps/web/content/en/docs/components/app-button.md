---
title: AppButton
description: "Primary button component for user actions. Adapts its size, weight and radius\nto the active platform tokens and supports an inline loading state that\ndisables interaction while async work is in flight."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Primary button component for user actions. Adapts its size, weight and radius
to the active platform tokens and supports an inline loading state that
disables interaction while async work is in flight.

## Preview

<ClientOnly>

::AppButtonDemo
::

</ClientOnly>

## Usage

```vue
<AppButton variant="primary" :loading="saving" @click="save">Save</AppButton>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "ghost" \| "link"` | `'primary'` | Visual variant. `primary` is the dominant action, `ghost` is a low-emphasis alternative, `link` is text-only. |
| `loading` | `boolean` | `false` | When true, replaces the slot with a spinner and disables the button. |
| `disabled` | `boolean` | `false` | When true, dims the button and blocks interaction. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | — |
