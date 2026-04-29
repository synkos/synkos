---
title: AuthFieldRow
description: "A single input row for the auth screens. Designed to be placed inside\n`AuthFieldGroup`. When `type=\"password\"` it renders a built-in eye toggle\nfor visibility. Forwards unknown attributes (autocomplete, inputmode,\nplaceholder...) to the underlying `<input>`."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

A single input row for the auth screens. Designed to be placed inside
`AuthFieldGroup`. When `type="password"` it renders a built-in eye toggle
for visibility. Forwards unknown attributes (autocomplete, inputmode,
placeholder...) to the underlying `<input>`.

## Usage

```vue
<AuthFieldGroup>
  <AuthFieldRow
    v-model="email"
    type="email"
    autocomplete="email"
    placeholder="Email"
    :error="!!errors.email"
  />
  <AuthFieldRow v-model="password" type="password" placeholder="Password" />
</AuthFieldGroup>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string` | — | Bound value. Use `v-model`. |
| `type` | `string` | `'text'` | HTML `type` attribute. `password` enables the visibility toggle. |
| `error` | `boolean` | — | Apply error styling to the row. |
| `showPassword` | `boolean` | — | Force the password to be visible (overrides the internal toggle). |

## Events

| Name | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string` | Emitted on input. |
| `update:showPassword` | `boolean` | Emitted when the user toggles password visibility. |
| `input` | `Event` | Re-emitted native `input` event. |

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `prefix` | — | Slot rendered before the `<input>` (icon, country flag, currency, ...). |
| `suffix` | — | Slot rendered after the `<input>` (clear button, status icon, ...). |
