---
title: SegmentControl
description: "iOS-style segmented selector. Use it when there are 2-4 mutually exclusive\noptions that fit on a single line. Bind via `v-model`."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

iOS-style segmented selector. Use it when there are 2-4 mutually exclusive
options that fit on a single line. Bind via `v-model`.

## Preview

<ClientOnly>

::SegmentControlDemo
::

</ClientOnly>

## Usage

```vue
<SegmentControl
  v-model="filter"
  :options="[
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'flagged', label: 'Flagged' },
  ]"
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` _(required)_ | `{ value: string; label: string }[]` | — | Available options. Each item has a value and a display label. |
| `modelValue` _(required)_ | `string` | — | Currently selected value. Use `v-model` to bind. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string` | Emitted when the user selects a different option. |
