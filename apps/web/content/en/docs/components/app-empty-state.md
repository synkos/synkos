---
title: AppEmptyState
description: "Centered placeholder shown when a list, page or feed has nothing to display.\nOptionally takes a single primary action that the user can tap to recover\n(refresh, create the first item, change a filter)."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

Centered placeholder shown when a list, page or feed has nothing to display.
Optionally takes a single primary action that the user can tap to recover
(refresh, create the first item, change a filter).

## Preview

<ClientOnly>

::AppEmptyStateDemo
::

</ClientOnly>

## Usage

```vue
<AppEmptyState
  icon="inbox"
  title="Inbox is empty"
  subtitle="You're all caught up. New messages will appear here."
  :action="{ label: 'Refresh', icon: 'refresh', onClick: refetch }"
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` _(required)_ | `string` | — | Icon name shown in the rounded square above the title. |
| `title` _(required)_ | `string` | — | Bold headline communicating the empty state. |
| `subtitle` | `string` | — | Optional helper text under the title (line breaks preserved). |
| `action` | `EmptyAction` | — | Optional primary action. Renders a CTA below the subtitle. |
