---
title: AppAlert
description: "iOS-style alert dialog (UIAlertController in alert style). A centered,\ncompact modal that surfaces a title, an optional message and one or\nmore action buttons. Use it for consequential prompts that demand a\ndecision — confirmations, errors that need acknowledgement, \"are you\nsure?\" flows.\n\nFor long lists of choices or a clear \"destructive vs the rest\"\nseparation, prefer `AppActionSheet` instead — it slides up from the\nbottom and handles many actions more comfortably."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/ui`

iOS-style alert dialog (UIAlertController in alert style). A centered,
compact modal that surfaces a title, an optional message and one or
more action buttons. Use it for consequential prompts that demand a
decision — confirmations, errors that need acknowledgement, "are you
sure?" flows.

For long lists of choices or a clear "destructive vs the rest"
separation, prefer `AppActionSheet` instead — it slides up from the
bottom and handles many actions more comfortably.

## Usage

```vue
<AppAlert
  v-model="show"
  title="Discard draft?"
  message="Your changes haven't been saved."
  :actions="[
    { label: 'Cancel', role: 'cancel' },
    { label: 'Discard', role: 'destructive', onSelect: discard },
  ]"
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` _(required)_ | `boolean` | — | Visibility — bind with v-model. |
| `title` | `string` | — | Bold heading at the top of the card. |
| `message` | `string` | — | Smaller body text under the title. |
| `actions` _(required)_ | `AlertAction[]` | — | Action buttons. 1-2 actions render side-by-side; 3+ stack
vertically (matching iOS UIAlertController behaviour). |
| `dismissOnBackdrop` | `boolean` | `false` | Whether tapping the dimmed backdrop dismisses the alert. Defaults
to false — alerts in iOS are typically modal and require a
deliberate button press. |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `boolean` | — |
