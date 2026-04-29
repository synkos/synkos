---
title: AppSpinner
description: "Indeterminate loading spinner. Use it inline (next to text) or as a\npage-level loader. Colors map to the framework palette: pass a semantic name\n(`primary`, `negative`, `white`...) or any CSS color."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Indeterminate loading spinner. Use it inline (next to text) or as a
page-level loader. Colors map to the framework palette: pass a semantic name
(`primary`, `negative`, `white`...) or any CSS color.

## Preview

<ClientOnly>

::AppSpinnerDemo
::

</ClientOnly>

## Usage

```vue
<AppSpinner /> <!-- 24px white spinner -->
<AppSpinner size="32px" color="primary" />
<AppSpinner color="#ff0099" />
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `string` | `'24px'` | CSS size of the spinner (e.g. `"24px"`, `"2rem"`). |
| `color` | `string` | `'white'` | Spinner color: a framework name (`primary`, `negative`, `white`, ...) or any CSS color. |
