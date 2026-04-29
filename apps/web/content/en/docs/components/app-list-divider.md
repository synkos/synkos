---
title: AppListDivider
description: "A hairline separator drawn between list rows. Defaults to indenting past the\nrow icon — pass `indent=\"0\"` for a full-width divider."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

A hairline separator drawn between list rows. Defaults to indenting past the
row icon — pass `indent="0"` for a full-width divider.

## Preview

<ClientOnly>

::AppListDividerDemo
::

</ClientOnly>

## Usage

```vue
<AppListSection>
  <AppListRow icon="person" label="Profile" />
  <AppListDivider />
  <AppListRow icon="lock" label="Password" />
</AppListSection>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `indent` | `number` | — | Left margin in px. Use `0` for a full-width divider. |
