---
title: AppSwitch
description: "iOS-style toggle switch (UISwitch). Animated thumb glide with the\nnative cubic-bezier curve, system-green fill when on, light haptic\nimpact on each flip. Use it standalone or as the right-hand control\nof an `AppListRow` for a settings-style row."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

iOS-style toggle switch (UISwitch). Animated thumb glide with the
native cubic-bezier curve, system-green fill when on, light haptic
impact on each flip. Use it standalone or as the right-hand control
of an `AppListRow` for a settings-style row.

## Usage

```vue
<AppSwitch v-model="enabled" />
```

```vue
<AppListRow label="Notifications">
  <template #right>
    <AppSwitch v-model="prefs.push" />
  </template>
</AppListRow>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Bound boolean — toggles between on (true) and off (false). |
| `disabled` | `boolean` | `false` | When true, blocks interaction and dims the control. |
| `ariaLabel` | `string` | — | Optional accessible label for screen readers. |
| `haptic` | `boolean` | `true` | Whether to fire a light haptic impact on flip. Defaults to `true`,
matching iOS UISwitch behaviour. Pass `false` for silent toggles
(e.g. when wiring lots of switches and the parent will batch one
confirmation haptic). |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Emitted on each flip with the new value. |
