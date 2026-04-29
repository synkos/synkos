---
title: AppIcon
description: "Renders an icon from the synkos-ui icon registry as inline SVG. Color is\ncontrolled via the parent's CSS `color` property (the icon uses\n`currentColor`); pass color through `style` or a parent class instead of\nthe `color` prop."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Renders an icon from the synkos-ui icon registry as inline SVG. Color is
controlled via the parent's CSS `color` property (the icon uses
`currentColor`); pass color through `style` or a parent class instead of
the `color` prop.

## Preview

<ClientOnly>

::AppIconDemo
::

</ClientOnly>

## Usage

```vue
<AppIcon name="chevron_right" size="20px" />
<AppIcon name="bell" style="color: var(--color-primary)" />
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `name` _(required)_ | `string` | — | Icon name. See the icon registry for the full list. |
| `size` | `string` | `'24px'` | CSS size, applied to both width and height. |
| `color` | `string` | — | Currently unused — control color via `currentColor` from a parent. |
