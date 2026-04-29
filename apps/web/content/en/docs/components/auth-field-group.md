---
title: AuthFieldGroup
description: "Card wrapper that groups consecutive `AuthFieldRow` instances and draws\nhairlines between them. The visual base of every form on `LoginPage`,\n`ChangePasswordPage`, and other auth screens."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

> Imported from `@synkos/client`

Card wrapper that groups consecutive `AuthFieldRow` instances and draws
hairlines between them. The visual base of every form on `LoginPage`,
`ChangePasswordPage`, and other auth screens.

## Usage

```vue
<AuthFieldGroup>
  <AuthFieldRow v-model="email" type="email" placeholder="Email" />
  <AuthFieldRow v-model="password" type="password" placeholder="Password" />
</AuthFieldGroup>
```

## Slots

| Name | Scope | Description |
| --- | --- | --- |
| `default` | — | Field rows. Typically `AuthFieldRow` instances. |
