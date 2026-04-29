---
title: AuthFeedback
description: "Feedback strip used in auth forms — renders one of four states based on\nwhich prop is set. Designed for the single-line space below a field group:\n\n1. `loading` → spinner\n2. `success` → success message with check icon\n3. `fieldError` → small inline error\n4. `globalError` → highlighted error card with icon\n\nReserve the height even when empty (the component keeps a minimum size) so\nthe form doesn't jump as state changes."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Feedback strip used in auth forms — renders one of four states based on
which prop is set. Designed for the single-line space below a field group:

1. `loading` → spinner
2. `success` → success message with check icon
3. `fieldError` → small inline error
4. `globalError` → highlighted error card with icon

Reserve the height even when empty (the component keeps a minimum size) so
the form doesn't jump as state changes.

## Usage

```vue
<AuthFeedback
  :loading="submitting"
  :field-error="errors.email"
  :global-error="errors.global"
  :success="successMessage"
/>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `loading` | `boolean` | — | Show the spinner state. Takes priority over the other states. |
| `fieldError` | `string` | — | Inline error text (typically next to a single field). |
| `globalError` | `string` | — | Highlighted error card spanning the form. |
| `success` | `string` | — | Success confirmation message. |
