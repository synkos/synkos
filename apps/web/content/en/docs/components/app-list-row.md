---
title: AppListRow
description: "A single row inside a list section. Renders as a `<button>` (interactive) or\na `<div>` when a static `value` is provided (read-only display row).\n\nUse it for settings entries, navigation items, and key/value displays."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

A single row inside a list section. Renders as a `<button>` (interactive) or
a `<div>` when a static `value` is provided (read-only display row).

Use it for settings entries, navigation items, and key/value displays.

## Preview

<ClientOnly>

::AppListRowDemo
::

</ClientOnly>

## Usage

```vue
<AppListSection title="Account">
  <AppListRow icon="person" label="Profile" @click="open('profile')" />
  <AppListRow icon="lock" label="Password" @click="open('password')" />
  <AppListRow icon="trash" label="Delete account" danger @click="confirmDelete" />
</AppListSection>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | — | Icon name from the synkos-ui icon registry. Omit for text-only rows. |
| `iconColor` | `string` | — | Foreground color for the icon (CSS color). |
| `iconBg` | `string` | — | Background color of the icon tile. |
| `label` _(required)_ | `string` | — | Primary label of the row. Required. |
| `hint` | `string` | — | Secondary hint shown under the label. |
| `disabled` | `boolean` | — | Dim the row and block interaction. |
| `danger` | `boolean` | — | Render label in the destructive color (delete actions). |
| `comingSoon` | `boolean` | — | Show a "coming soon" badge instead of the chevron. |
| `comingSoonLabel` | `string` | `'Coming soon'` | Override the badge label when `comingSoon` is true. |
| `value` | `string` | — | Read-only value (e.g. "Premium", "v1.2.3"). When set the row is non-interactive. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `click` | — | Fired when the row is tapped. Not emitted on disabled or value rows. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `right` | — | — |
