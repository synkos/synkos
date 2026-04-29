---
title: AppCircularProgress
description: "Circular progress indicator. Two modes:\n\n- **Determinate** — pass `value` (0-100). The arc grows as work progresses.\n- **Indeterminate** — set `indeterminate` to true. The arc spins continuously."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Circular progress indicator. Two modes:

- **Determinate** — pass `value` (0-100). The arc grows as work progresses.
- **Indeterminate** — set `indeterminate` to true. The arc spins continuously.

## Preview

<ClientOnly>

::AppCircularProgressDemo
::

</ClientOnly>

## Usage

```vue
<!-- Determinate progress for an upload -->
<AppCircularProgress :value="uploadPct" size="32px" />

<!-- Indeterminate while waiting for a server response -->
<AppCircularProgress indeterminate color="primary" track-color="rgba(255,255,255,0.1)" />
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `string` | `'24px'` | CSS size (e.g. `"24px"`, `"2rem"`). |
| `color` | `string` | `'primary'` | Indicator color. Framework name or any CSS color. |
| `trackColor` | `string` | `'transparent'` | Track (background ring) color. `"transparent"` hides the track. |
| `value` | `number` | `0` | Progress value 0-100. Ignored when `indeterminate` is true. |
| `indeterminate` | `boolean` | `false` | Spin continuously instead of using `value`. |
