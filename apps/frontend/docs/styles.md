# Synkos Template — Style Architecture

## Table of Contents

- [Overview](#overview)
- [Three-layer system](#three-layer-system)
- [Layer 1 — SCSS variables](#layer-1--scss-variables-quasarvariablesscss)
- [Layer 2 — CSS custom properties](#layer-2--css-custom-properties)
  - [Theme tokens](#theme-tokens)
  - [Auth tokens](#auth-tokens)
  - [Switching themes](#switching-themes)
- [Layer 3 — Platform tokens](#layer-3--platform-tokens-platformscss)
- [Writing component styles](#writing-component-styles)
- [Global styles (`app.scss`)](#global-styles-appscss)

---

## Overview

The style system has three layers, each serving a different purpose:

| Layer | File                                   | Scope             | When applied                               |
| ----- | -------------------------------------- | ----------------- | ------------------------------------------ |
| 1     | `quasar.variables.scss`                | SCSS compile-time | Every `<style lang="scss">` in the project |
| 2     | `dark.theme.scss` / `light.theme.scss` | CSS runtime       | Driven by `data-theme` on `<html>`         |
| 3     | `platform.scss`                        | CSS runtime       | Driven by `data-platform` on `<html>`      |

---

## Three-layer system

```
quasar.variables.scss     ← SCSS variables ($space-8, $font-body, $primary)
       ↓
Compiled into component styles — spacing, border-radius, typography

dark.theme.scss           ← CSS custom properties (--color-primary, --surface-bg)
light.theme.scss          ← Same structure, different values
       ↓
Runtime theme switching — SynkosApp.vue toggles data-theme="dark|light"
useTheme() composable → reads data-theme → system preference listener

platform.scss             ← CSS custom properties (--nav-bar-height, --platform-transition-push)
       ↓
Runtime platform adaptation — boot sets data-platform="ios|android|web"
MainLayout reads var(--nav-bar-height), var(--tab-bar-height) etc.
```

---

## Layer 1 — SCSS variables (`quasar.variables.scss`)

Available in every `<style lang="scss">` block automatically (injected by Quasar's build system).

### Key tokens

```scss
// Colors (Quasar semantic + framework-specific)
$primary: #0a84ff; // iOS blue — buttons, links, active states
$secondary: #30d158; // iOS green — success
$negative: #ff453a; // iOS red — errors, destructive
$warning: #ffd60a; // iOS yellow — cautions
$dark: #1c1c1e; // iOS dark surface
$dark-page: #000000; // page background

// Surfaces (for dark mode layering)
$surface-1: rgba(255, 255, 255, 0.05); // subtle cards
$surface-2: rgba(255, 255, 255, 0.06); // list groups, elevated cards
$surface-press: rgba(255, 255, 255, 0.04); // tap state

// Glass morphism (nav bar, tab bar, bottom sheets)
$glass-bg: rgba(28, 28, 30, 0.82);
$glass-blur: saturate(180%) blur(20px);
$glass-blur-heavy: saturate(180%) blur(40px);
$glass-border: rgba(255, 255, 255, 0.12);

// Text hierarchy (7 levels)
$text-primary: rgba(255, 255, 255, 0.95); // headings
$text-secondary: rgba(255, 255, 255, 0.9); // body
$text-muted: rgba(255, 255, 255, 0.75); // secondary text
$text-label: rgba(235, 235, 245, 0.45); // section headers (ALL CAPS)
$text-tertiary: rgba(235, 235, 245, 0.38); // hints, placeholders

// Typography scale
$font-xs: 10px; // badges, labels
$font-sm: 11px; // tab labels
$font-caption: 12px; // section headers, hints
$font-body-sm: 13px; // secondary text
$font-body: 15px; // primary body
$font-body-lg: 17px; // nav bar, inputs
$font-title-sm: 20px; // sheet titles
$font-display: 34px; // large page titles

// Spacing (4-based grid)
$space-1: 2px;
$space-2: 4px;
$space-3: 6px;
$space-4: 8px;
$space-5: 10px;
$space-6: 12px;
$space-8: 16px;
$space-10: 20px;
$space-12: 24px;
$space-16: 32px;
$space-20: 40px;
$space-24: 48px;

// Border radius
$radius-xs: 6px;
$radius-sm: 8px;
$radius-md: 10px;
$radius-lg: 12px;
$radius-xl: 14px;
$radius-2xl: 16px;
$radius-3xl: 18px;
$radius-full: 9999px;

// Transitions
$transition-quick: 0.15s ease;
$transition-base: 0.2s ease;
$transition-spring: 0.32s cubic-bezier(0.36, 0.66, 0.04, 1);
$transition-ios: 0.28s cubic-bezier(0.36, 0.66, 0.04, 1);
$transition-bounce: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

// Z-index tiers
$z-base: 0;
$z-raised: 10;
$z-overlay: 100;
$z-modal: 1000;
$z-splash: 9999;
```

---

## Layer 2 — CSS custom properties

Runtime values applied to `:root` based on the active theme. These cascade to all components.

### Theme tokens

Defined in `dark.theme.scss` and `light.theme.scss`. Edit these to rebrand your app:

```scss
// src/css/dark.theme.scss — EDIT TO REBRAND
:root,
:root[data-theme='dark'] {
  // ── Brand ──────────────────────────────────────────────────────────────
  --color-primary: #0a84ff; // ← CHANGE THIS to rebrand
  --color-secondary: #30d158;
  --color-accent: #ff9f0a;
  --color-positive: #30d158;
  --color-negative: #ff453a;

  // ── Surface ─────────────────────────────────────────────────────────────
  --surface-bg: #000000;
  --surface-1: rgba(255, 255, 255, 0.05);
  --surface-2: rgba(255, 255, 255, 0.06);

  // ── Glass ───────────────────────────────────────────────────────────────
  --glass-bg: rgba(28, 28, 30, 0.82);
  --glass-border: rgba(255, 255, 255, 0.12);

  // ── Text ────────────────────────────────────────────────────────────────
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-muted: rgba(255, 255, 255, 0.75);
  --text-label: rgba(235, 235, 245, 0.45);
}
```

### Auth tokens

Auth pages (`LoginPage.vue`, `UsernamePage.vue`) use dedicated tokens so the auth screen can be styled independently:

```scss
// in dark.theme.scss
--auth-bg: #000000;
--auth-icon-bg: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
--auth-sheet-bg: #1c1c1e;
--auth-surface-1: rgba(255, 255, 255, 0.07);
--auth-text-primary: rgba(255, 255, 255, 0.92);
--auth-text-muted: rgba(235, 235, 245, 0.45);
--auth-border: rgba(255, 255, 255, 0.1);
```

To create a custom-branded auth screen (e.g. purple background, custom gradient):

```scss
// dark.theme.scss
--auth-bg: #0f0a1e;
--auth-icon-bg: linear-gradient(145deg, #6750a4, #9c27b0);
```

No page code changes needed — just CSS variables.

### Switching themes

The user switches in Settings → Preferences. `useSettingsStore().theme` drives it.

`SynkosApp.vue` calls `useTheme().applyTheme(settingsStore.theme)` which sets `document.documentElement.dataset.theme = 'dark' | 'light'`.

System preference is respected when `theme = 'system'`.

---

## Layer 3 — Platform tokens (`platform.scss`)

Driven by `data-platform` on `<html>`, applied at boot by `createSynkosBoot`.

```scss
:root[data-platform='ios'] {
  --nav-bar-height: 44px;
  --tab-bar-height: 49px;
  --nav-content-size: 44px;
  --platform-transition-push: 0.32s cubic-bezier(0.36, 0.66, 0.04, 1);
  --platform-transition-modal: 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --platform-transition-quick: 0.15s ease;
}

:root[data-platform='android'] {
  --nav-bar-height: 64px;
  --tab-bar-height: 80px;
  --nav-content-size: 56px;
  --platform-transition-push: 0.3s cubic-bezier(0.2, 0, 0, 1); // Material 3
  --platform-transition-modal: 0.4s cubic-bezier(0.05, 0.7, 0.1, 1);
}
```

`MainLayout.vue` uses these:

```scss
.ios-nav-content {
  height: var(--nav-content-size, 44px);
}
.ios-tabs {
  height: var(--tab-bar-height, 49px);
}
.tab-slide-left-enter-active {
  transition: transform var(--platform-transition-push, 0.32s...);
}
```

---

## Writing component styles

Use SCSS variables for static design decisions (spacing, radius, typography). Use CSS custom properties when the value needs to change at runtime (colors, theme-sensitive surfaces).

```vue
<style lang="scss" scoped>
// ✅ Good — tokens for everything
.my-card {
  background: var(--surface-2, #{$surface-2}); // CSS var with SCSS fallback
  border: 0.5px solid var(--border-medium, #{$border-medium});
  border-radius: $radius-xl; // pure SCSS — doesn't change at runtime
  padding: $space-6 $space-8;
  transition: opacity $transition-quick;

  .title {
    font-size: $font-body-lg;
    font-weight: 600;
    color: var(--text-primary, #{$text-primary});
  }

  .hint {
    font-size: $font-body-sm;
    color: var(--text-label, #{$text-label});
    margin-top: $space-2;
  }
}

// ❌ Avoid — hardcoded values
.my-card-bad {
  background: rgba(255, 255, 255, 0.06); // what does this mean?
  font-size: 13px; // which scale level is this?
  color: rgba(235, 235, 245, 0.45); // doesn't change on light theme
}
</style>
```

**Pattern for theme-aware colors:** use `var(--css-token, #{$scss-fallback})`. The CSS var changes on theme switch; the SCSS fallback handles the case where the var isn't defined (e.g. in isolated tests or Storybook).

---

## Global styles (`app.scss`)

Shared across all components — use sparingly:

```scss
// src/css/app.scss

// Vue transition used by many pages — <Transition name="fade">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Add your own shared transitions here:
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform $transition-spring,
    opacity 0.25s ease;
}
.slide-up-enter-from {
  transform: translateY(24px);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(24px);
  opacity: 0;
}
```

Keep `app.scss` for transitions and keyframes only. Component-specific styles belong in scoped `<style>` blocks.
