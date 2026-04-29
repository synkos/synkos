---
title: Theming
description: SCSS tokens, CSS custom properties, dark and light, platform-aware values.
order: 3
---

Synkos has a three-layer theme system: SCSS variables for compile-time tokens, CSS custom properties for runtime-switchable colors, and platform tokens that adapt the UI to iOS or Android. Learn the layers and you can rebrand the framework without touching component code.

## The three layers

### Layer 1 — SCSS variables (`quasar.variables.scss`)

Compile-time design tokens: spacing, radii, font sizes, line heights. Available inside any `<style lang="scss">` block.

```scss
// src/css/quasar.variables.scss
$space-1: 4px;
$space-4: 16px;
$radius-md: 10px;
$font-body: 15px;
$font-body-lg: 17px;
```

```vue
<style lang="scss" scoped>
.card {
  padding: $space-4;
  border-radius: $radius-md;
  font-size: $font-body;
}
</style>
```

These don't change at runtime. They're tokens, not theme values.

### Layer 2 — CSS custom properties (themes)

Runtime-switchable colors. Two files, one per theme:

```scss
// src/css/dark.theme.scss (default)
[data-theme='dark'] {
  --color-primary: #7c3aed;
  --bg-canvas: #0a0a0b;
  --bg-elevated: #111114;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --border-default: rgba(255, 255, 255, 0.1);
}
```

```scss
// src/css/light.theme.scss
[data-theme='light'] {
  --color-primary: #6d28d9;
  --bg-canvas: #ffffff;
  --bg-elevated: #fafafa;
  --text-primary: #0a0a0b;
  --text-secondary: #52525b;
  --border-default: rgba(0, 0, 0, 0.1);
}
```

`SynkosApp.vue` toggles `data-theme` on `<html>`. Use the variables everywhere:

```vue
<style lang="scss" scoped>
.card {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
</style>
```

### Layer 3 — Platform tokens (`platform.scss`)

Some values change between iOS and Android: the nav bar height, the tab bar height, the transition curves, the safe-area handling. These are driven by `data-platform` on `<html>`:

```scss
[data-platform='ios'] {
  --nav-bar-height: 44px;
  --tab-bar-height: 83px;
  --transition-curve: cubic-bezier(0.32, 0.72, 0, 1);
}

[data-platform='android'] {
  --nav-bar-height: 56px;
  --tab-bar-height: 64px;
  --transition-curve: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-platform='web'] {
  --nav-bar-height: 56px;
  --tab-bar-height: 64px;
  --transition-curve: cubic-bezier(0.4, 0, 0.2, 1);
}
```

`createSynkosBoot` applies the right `data-platform` for you. You just consume the variables.

## Switching themes

Use `useTheme()` from `@synkos/client`:

```ts
import { useTheme } from '@synkos/client';

const { theme, applyTheme } = useTheme();

theme.value; // 'light' | 'dark' | 'system'
applyTheme('light'); // persists and re-renders
applyTheme('system'); // follows OS preference, listens for changes
```

The `system` mode listens to `prefers-color-scheme` and updates without a page reload. Persistence uses `@capacitor/preferences` so it survives app restarts.

## The auth screen tokens

The login screen has its own subset of tokens so you can rebrand auth without touching the rest of the app:

```scss
[data-theme='dark'] {
  --auth-bg: linear-gradient(140deg, #0a0a0b, #111114);
  --auth-text-primary: #ffffff;
  --auth-text-secondary: #a1a1aa;
  --auth-surface-card: rgba(255, 255, 255, 0.04);
  --auth-surface-input: rgba(255, 255, 255, 0.08);
}
```

Override these in your project's theme files to make `LoginPage.vue` look like your brand without editing the page.

## Conditional styling per platform

Prefer CSS over JS for platform-specific styling. Use the `data-platform` attribute on `<html>`:

```scss
[data-platform='ios'] .header {
  font-weight: 600; // SF heavy
  letter-spacing: -0.4px;
}

[data-platform='android'] .header {
  font-weight: 500; // Roboto medium
  letter-spacing: 0;
}
```

For JS-based platform checks, use `usePlatform()` (see the [Capacitor guide](/docs/guide/capacitor)).

## Where to put new tokens

| Type of value                        | Where it goes                                |
| ------------------------------------ | -------------------------------------------- |
| Spacing, radius, type scale          | `quasar.variables.scss`                      |
| Brand color (changes per theme)      | `dark.theme.scss` + `light.theme.scss`       |
| Auth-specific brand color            | `--auth-*` in both theme files               |
| Platform difference (iOS vs Android) | `platform.scss` under each `[data-platform]` |
| Component-internal value not reused  | Inline in the component's `<style>`          |

## Anti-patterns

**Don't hardcode colors.** Always use a CSS custom property — even for things you think are "just black":

```vue
<!-- ❌ -->
<style scoped>
.card {
  background: #111;
  color: #fff;
}
</style>

<!-- ✅ -->
<style scoped>
.card {
  background: var(--bg-elevated);
  color: var(--text-primary);
}
</style>
```

**Don't put platform branches in JS unless you must.** A two-line CSS rule beats a `usePlatform()` watcher.

**Don't modify framework theme files in your project.** They live in `src/css/`. Override the values there; don't fork the framework.

## Common patterns

### Per-component theme override

Wrap a section in a `data-theme` attribute to force a theme locally:

```vue
<template>
  <section data-theme="dark" class="hero">
    <!-- this section is always dark, even if the app is in light mode -->
  </section>
</template>
```

### Reading a CSS variable in JS

```ts
const root = getComputedStyle(document.documentElement);
const primary = root.getPropertyValue('--color-primary').trim();
```

### Adding your own brand variable

In both `dark.theme.scss` and `light.theme.scss`:

```scss
[data-theme='dark'] {
  --brand-confetti: #ff44a4;
}
[data-theme='light'] {
  --brand-confetti: #d62888;
}
```

Use it the same as any other token: `background: var(--brand-confetti);`.

## Next steps

- [i18n](/docs/guide/i18n) — translating your app's strings
- [Capacitor](/docs/guide/capacitor) — when to reach for `usePlatform()` instead of CSS
