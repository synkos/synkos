---
title: AppActionSheet
description: "iOS-style action sheet (UIActionSheet). Renders a grouped list of\nactions sliding up from the bottom, with a separated cancel button —\nthe iOS pattern for \"what do you want to do?\" prompts where one of\nthe choices is destructive (delete, sign out, …).\n\nBuilt on top of `AppBottomSheet` so dismiss-on-backdrop, transitions\nand accessibility behave like every other Synkos sheet."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

iOS-style action sheet (UIActionSheet). Renders a grouped list of
actions sliding up from the bottom, with a separated cancel button —
the iOS pattern for "what do you want to do?" prompts where one of
the choices is destructive (delete, sign out, …).

Built on top of `AppBottomSheet` so dismiss-on-backdrop, transitions
and accessibility behave like every other Synkos sheet.

## Usage

```vue
<AppActionSheet
  v-model="show"
  title="Delete item?"
  message="This cannot be undone."
  :actions="[
    { label: 'Delete', role: 'destructive', onSelect: doDelete },
    { label: 'Archive', onSelect: doArchive },
  ]"
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Visibility of the sheet. Use with `v-model`. |
| `title` | `string` | — | Optional title shown at the top of the action group. |
| `message` | `string` | — | Optional secondary line under the title (call-to-action context). |
| `cancelLabel` | `string` | `'Cancel'` | Label of the cancel button. Defaults to 'Cancel'. |
| `actions` _(required)_ | `ActionSheetAction[]` | — | Action rows to render inside the main group. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | Fired with the new value on every visibility change. |
| `cancel` | — | Fired right after the user dismisses without selecting an action. |
