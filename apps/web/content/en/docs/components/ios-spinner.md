---
title: IOSSpinner
description: "Native-style iOS activity indicator (the 12-bar `UIActivityIndicatorView`\nrendition). Use anywhere you would otherwise reach for a generic spinner —\nit visually matches the rest of the iOS chrome and looks at home both\ninline (next to text) and at page level."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Native-style iOS activity indicator (the 12-bar `UIActivityIndicatorView`
rendition). Use anywhere you would otherwise reach for a generic spinner —
it visually matches the rest of the iOS chrome and looks at home both
inline (next to text) and at page level.

## Usage

```vue
<IOSSpinner />                         // 20px, currentColor
<IOSSpinner size="32px" color="primary" />
<IOSSpinner color="#ff0099" />
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `string` | `'20px'` | CSS size of the spinner box (e.g. `"20px"`, `"2rem"`). |
| `color` | `string` | `'current'` | Bar color: a framework name (`primary`, `negative`, …), `current` to
inherit `color` from the parent, or any CSS color string. |
