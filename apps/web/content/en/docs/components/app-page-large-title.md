---
title: AppPageLargeTitle
description: "iOS-style large title that collapses into the nav bar as the page scrolls.\nPlace it at the top of an `AppPage` inside `MainLayout` — the layout\nprovides the inject token (`synkos:set-nav-title`) the component uses to\ncrossfade the compact title into the chrome.\n\nUsed outside a Synkos layout, it falls back gracefully (renders the title\nbut doesn't drive the nav bar)."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

iOS-style large title that collapses into the nav bar as the page scrolls.
Place it at the top of an `AppPage` inside `MainLayout` — the layout
provides the inject token (`synkos:set-nav-title`) the component uses to
crossfade the compact title into the chrome.

Used outside a Synkos layout, it falls back gracefully (renders the title
but doesn't drive the nav bar).

## Usage

```vue
<AppPage>
  <AppPageLargeTitle title="Inbox" subtitle="3 new messages">
    <template #right>
      <AppButton variant="ghost" @click="compose">New</AppButton>
    </template>
  </AppPageLargeTitle>
  <!-- list of messages -->
</AppPage>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `title` _(required)_ | `string` | — | Title shown large at the top and crossfaded into the nav bar on scroll. |
| `subtitle` | `string` | — | Optional secondary line under the title. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `right` | — | Trailing slot rendered next to the title (e.g. an action button). |
