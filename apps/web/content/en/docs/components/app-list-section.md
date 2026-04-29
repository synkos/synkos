---
title: AppListSection
description: "Wraps a group of `AppListRow` (or any content) inside a card with rounded\ncorners and an optional uppercase section header above it. The standard way\nto lay out settings pages."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Wraps a group of `AppListRow` (or any content) inside a card with rounded
corners and an optional uppercase section header above it. The standard way
to lay out settings pages.

## Preview

<ClientOnly>

::AppListSectionDemo
::

</ClientOnly>

## Usage

```vue
<AppListSection title="Notifications">
  <AppListRow icon="bell" label="Push" @click="..." />
  <AppListRow icon="mail" label="Email" @click="..." />
</AppListSection>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Uppercase header rendered above the card. Optional. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | Section content — typically `AppListRow` instances. |
