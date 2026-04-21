# TGC App — Style Architecture

## Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Layer 1 — Design Tokens (`quasar.variables.scss`)](#layer-1--design-tokens-quasarvariablesscss)
  - [Quasar Semantic Colors](#quasar-semantic-colors)
  - [Surface System](#surface-system)
  - [Glass Morphism](#glass-morphism)
  - [Text Hierarchy](#text-hierarchy)
  - [Separators & Borders](#separators--borders)
  - [Typography Scale](#typography-scale)
  - [Letter Spacing](#letter-spacing)
  - [Spacing Scale](#spacing-scale)
  - [Border Radius](#border-radius)
  - [Transitions](#transitions)
  - [Z-Index Scale](#z-index-scale)
- [Layer 2 — Global Styles (`app.scss`)](#layer-2--global-styles-appscss)
  - [Foundation](#foundation)
  - [Page Defaults](#page-defaults)
  - [Quasar Overrides](#quasar-overrides)
  - [Shared Animations](#shared-animations)
  - [Shared Transitions](#shared-transitions)
- [Layer 3 — Component Styles (`<style scoped>`)](#layer-3--component-styles-style-scoped)
  - [When to use scoped styles](#when-to-use-scoped-styles)
  - [When to use `app.scss` instead](#when-to-use-appscss-instead)
  - [Token usage in components](#token-usage-in-components)
- [Design Decisions](#design-decisions)
  - [iOS Design Language](#ios-design-language)
  - [Dark-only theme](#dark-only-theme)
  - [No CSS custom properties (yet)](#no-css-custom-properties-yet)
- [Adding Styles — Decision Tree](#adding-styles--decision-tree)
- [Component Style Reference](#component-style-reference)

---

## Overview

The style system follows a strict three-layer architecture aligned with the app's `core/` vs `features/` code split:

```
Layer 1 — Design Tokens    src/css/quasar.variables.scss
Layer 2 — Global Styles    src/css/app.scss
Layer 3 — Component Styles <style scoped lang="scss"> inside each .vue
```

**Layer 1** is the single source of truth for every color, size, spacing, and timing value used in the app. It is auto-injected by Quasar into every `<style lang="scss">` block, so tokens are available everywhere without explicit imports.

**Layer 2** contains styles that must exist once in the DOM: global resets, default rules for Quasar primitives, shared CSS animations, and shared Vue transition classes.

**Layer 3** contains only styles that are unique to a specific component. It uses tokens from Layer 1 and never duplicates rules that belong in Layer 2.

---

## File Structure

```
src/css/
  quasar.variables.scss   ← Layer 1: SCSS design token system
  app.scss                ← Layer 2: Global resets, defaults, animations
```

Component styles live as `<style scoped lang="scss">` blocks inside each `.vue` file. There are no additional global SCSS files.

---

## Layer 1 — Design Tokens (`quasar.variables.scss`)

Quasar automatically injects this file into every component's `<style lang="scss">` block at build time. **All SCSS variables defined here are available in every component without any import.**

### Quasar Semantic Colors

Required by Quasar — drives the component palette (buttons, badges, icons, spinners). Do not rename or remove these.

```scss
$primary: #0a84ff; // iOS blue
$secondary: #30d158; // iOS green
$accent: #ff9f0a; // iOS orange
$dark: #1c1c1e; // iOS dark surface
$dark-page: #000000; // iOS pure-black page background
$positive: #30d158;
$negative: #ff453a;
$info: #64d2ff;
$warning: #ffd60a;
```

> These are also available as Quasar CSS variables (`--q-primary`, etc.) at runtime.

---

### Surface System

Layered backgrounds for cards, list groups, and interactive containers. All values use `rgba(white, x)` so they compose correctly over any dark background.

| Variable            | Value                     | Used for                      |
| ------------------- | ------------------------- | ----------------------------- |
| `$surface-bg`       | `#000000`                 | Page / root background        |
| `$surface-1`        | `rgba(255,255,255, 0.05)` | Subtle cards, stats row       |
| `$surface-1-border` | `rgba(255,255,255, 0.08)` | Border for surface-1 elements |
| `$surface-2`        | `rgba(255,255,255, 0.06)` | List groups, elevated cards   |
| `$surface-2-border` | `rgba(255,255,255, 0.08)` | Border for surface-2 elements |
| `$surface-press`    | `rgba(255,255,255, 0.04)` | Tap / active state flash      |
| `$surface-search`   | `rgba(118,118,128, 0.24)` | iOS search field background   |

**Usage example — a tappable card:**

```scss
.my-card {
  background: $surface-1;
  border: 0.5px solid $surface-1-border;

  &:active {
    background: $surface-press;
  }
}
```

---

### Glass Morphism

The frosted-glass style used by the navigation bar, tab bar, bottom sheets, and drawers.

| Variable            | Value                       | Used for                  |
| ------------------- | --------------------------- | ------------------------- |
| `$glass-bg`         | `rgba(28,28,30, 0.82)`      | Glass surface fill        |
| `$glass-blur`       | `saturate(180%) blur(20px)` | Nav/tab bar (lighter)     |
| `$glass-blur-heavy` | `saturate(180%) blur(40px)` | Bottom sheets (more blur) |
| `$glass-border`     | `rgba(255,255,255, 0.12)`   | Glass edge hairline       |

**Usage example — a glass panel:**

```scss
.my-sheet {
  background: $glass-bg;
  backdrop-filter: $glass-blur-heavy;
  -webkit-backdrop-filter: $glass-blur-heavy;
  border-top: 0.5px solid $glass-border;
}
```

> `backdrop-filter` requires both the standard and the `-webkit-` prefix for WKWebView (Capacitor iOS).

---

### Text Hierarchy

Seven semantic text levels matching the iOS label hierarchy.

| Variable              | Value                     | Used for                     |
| --------------------- | ------------------------- | ---------------------------- |
| `$text-primary`       | `rgba(255,255,255, 0.95)` | Headings, display titles     |
| `$text-secondary`     | `rgba(255,255,255, 0.90)` | Body copy, list row labels   |
| `$text-muted`         | `rgba(255,255,255, 0.75)` | Nav icons, secondary actions |
| `$text-disabled`      | `rgba(255,255,255, 0.55)` | Disabled / read-only text    |
| `$text-label`         | `rgba(235,235,245, 0.45)` | Section headers (ALL CAPS)   |
| `$text-secondary-ios` | `rgba(235,235,245, 0.55)` | iOS secondary label          |
| `$text-tertiary`      | `rgba(235,235,245, 0.38)` | Hints, placeholders          |
| `$text-quaternary`    | `rgba(235,235,245, 0.28)` | Legal notices, version text  |

---

### Separators & Borders

| Variable            | Value                     | Used for                            |
| ------------------- | ------------------------- | ----------------------------------- |
| `$separator`        | `rgba(255,255,255, 0.07)` | Inset row dividers (AppListDivider) |
| `$separator-strong` | `rgba(255,255,255, 0.12)` | Header/footer chrome borders        |
| `$border-subtle`    | `rgba(255,255,255, 0.08)` | Card and list-group borders         |
| `$border-medium`    | `rgba(255,255,255, 0.10)` | Modal and sheet borders             |
| `$border-strong`    | `rgba(255,255,255, 0.15)` | Focused or highlighted states       |

---

### Typography Scale

Mirrors the iOS Dynamic Type stops in use across the app.

| Variable         | Value  | Context                                   |
| ---------------- | ------ | ----------------------------------------- |
| `$font-xs`       | `10px` | Badge labels, "Coming Soon" chips         |
| `$font-sm`       | `11px` | Tab bar labels, stat category labels      |
| `$font-caption`  | `12px` | Section headers, copyright, row hints     |
| `$font-body-sm`  | `13px` | Secondary text, legal body, hints         |
| `$font-body`     | `15px` | Primary body, list row labels, buttons    |
| `$font-body-lg`  | `17px` | Nav bar title, inputs, search field       |
| `$font-title-sm` | `20px` | Sheet titles, dialog headers              |
| `$font-title`    | `22px` | Page-level titles (profile, stats)        |
| `$font-display`  | `34px` | Large display titles (home, grade center) |

---

### Letter Spacing

| Variable      | Value    | Context                      |
| ------------- | -------- | ---------------------------- |
| `$ls-tighter` | `-0.5px` | Display titles               |
| `$ls-tight`   | `-0.3px` | Card names, section titles   |
| `$ls-base`    | `-0.2px` | Nav title, back button label |
| `$ls-normal`  | `-0.1px` | General body text, hints     |
| `$ls-label`   | `+0.6px` | Section headers (ALL CAPS)   |
| `$ls-caps`    | `+0.2px` | Badge text, "Coming Soon"    |

---

### Spacing Scale

4-based scale aligned with the iOS 8pt grid. Variable names map to pixel values (`$space-4` = 4px, `$space-8` = 8px, etc.).

| Variable    | Value  |
| ----------- | ------ |
| `$space-1`  | `2px`  |
| `$space-2`  | `4px`  |
| `$space-3`  | `6px`  |
| `$space-4`  | `8px`  |
| `$space-5`  | `10px` |
| `$space-6`  | `12px` |
| `$space-7`  | `14px` |
| `$space-8`  | `16px` |
| `$space-10` | `20px` |
| `$space-12` | `24px` |
| `$space-16` | `32px` |
| `$space-20` | `40px` |
| `$space-24` | `48px` |

---

### Border Radius

Semantic naming by visual context, not by size.

| Variable       | Value    | Context                                  |
| -------------- | -------- | ---------------------------------------- |
| `$radius-xs`   | `6px`    | Small badges, inline chips               |
| `$radius-sm`   | `8px`    | Icon wrappers, small thumbnails          |
| `$radius-md`   | `10px`   | Search bar                               |
| `$radius-lg`   | `12px`   | Input fields, info boxes                 |
| `$radius-xl`   | `14px`   | List groups, primary buttons             |
| `$radius-2xl`  | `16px`   | Stats row, card list items               |
| `$radius-3xl`  | `18px`   | Collection cards                         |
| `$radius-4xl`  | `20px`   | Bottom sheets, segment control container |
| `$radius-full` | `9999px` | Pills, rounded badges, tag chips         |

---

### Transitions

| Variable             | Value                                     | Context                                        |
| -------------------- | ----------------------------------------- | ---------------------------------------------- |
| `$transition-quick`  | `0.15s ease`                              | Color/opacity flips (tab active, button hover) |
| `$transition-base`   | `0.2s ease`                               | General UI state changes                       |
| `$transition-spring` | `0.32s cubic-bezier(0.36, 0.66, 0.04, 1)` | Tab slides, drawer movements                   |
| `$transition-ios`    | `0.28s cubic-bezier(0.36, 0.66, 0.04, 1)` | iOS-style push animations                      |
| `$transition-bounce` | `0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`  | Bounce-in entrances                            |

---

### Z-Index Scale

| Variable     | Value  | Context                                     |
| ------------ | ------ | ------------------------------------------- |
| `$z-below`   | `-1`   | Behind normal flow                          |
| `$z-base`    | `0`    | Normal document flow                        |
| `$z-raised`  | `10`   | Elevated elements (FAB, positioned buttons) |
| `$z-overlay` | `100`  | Overlays, dropdowns                         |
| `$z-modal`   | `1000` | Dialogs, sheets                             |
| `$z-splash`  | `9999` | Splash screen (above everything)            |

---

## Layer 2 — Global Styles (`app.scss`)

### Foundation

```scss
html,
body {
  position: fixed; // Prevents WKWebView window rubber-band scroll
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
}

body {
  background: rgb(28, 28, 30); // Matches glass chrome — hides render gaps
}

#q-app {
  height: 100%;
}
```

> **Why `position: fixed` on `html`?** Capacitor's WKWebView ignores `overscroll-behavior: none`. The only reliable way to prevent the native window from rubber-banding (which would shift the fixed nav bar and tab bar) is to lock `html`/`body` to a fixed position and handle scrolling inside a contained child.

### Page Defaults

```scss
.q-page {
  background: #000000;
  min-height: 100%;
}
```

This single rule replaces what was previously duplicated in every single page component. Pages that need a different background (auth pages, scan page) or a different `min-height` (`100dvh` on form pages) declare their own rule — it will override the global one without side effects.

**Before refactoring:** Every page had:

```scss
.my-page {
  background: #000000; // duplicated in 20+ components
  min-height: 100%; // duplicated in 20+ components
}
```

**After refactoring:** Only pages with deviations declare anything:

```scss
// Form pages that need dynamic viewport height
.edit-profile-page {
  min-height: 100dvh; // overrides global 100%
}

// Pages with flex layout for FAB or sticky footer
.gc-page {
  display: flex;
  flex-direction: column; // background and min-height come from global
}
```

### Quasar Overrides

```scss
// app.scss — moved here from AppMenuDrawer.vue's unscoped <style> block
body.q-ios-padding .q-dialog__inner--right {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  > div {
    max-height: 100dvh !important;
    height: 100dvh !important;
  }
}
```

Global Quasar component overrides must live in `app.scss`, not inside component `<style>` blocks (even unscoped ones). Unscoped styles inside `.vue` files still get processed per-component and can have ordering issues. `app.scss` guarantees they are applied once, at root level.

### Shared Animations

`@keyframes` declarations cannot be scoped. A `@keyframes shimmer` inside a `<style scoped>` block is valid SCSS but the animation name exists in the global namespace anyway — the scope hash has no effect on keyframes. Defining them in `app.scss` makes this explicit and avoids duplicating the same declaration across multiple components.

```scss
// Used by: CollectionPage, CatalogPage, CardsPage
@keyframes shimmer {
  0% {
    background-position: -300px 0;
  }
  100% {
    background-position: 300px 0;
  }
}

// Used by: CollectionPage, CatalogPage
@keyframes ptr-spin {
  to {
    transform: rotate(360deg);
  }
}
```

Components reference these by name in their scoped styles:

```scss
// inside CollectionPage <style scoped>
.pull-spinner {
  animation: ptr-spin 0.65s linear infinite; // keyframe lives in app.scss
}
```

### Shared Transitions

Vue's `<Transition name="fade">` requires `.fade-enter-active`, `.fade-leave-active`, etc. to exist as global CSS classes (they are not scoped). Defining them once in `app.scss` means any component can use `<Transition name="fade">` without declaring anything in its own style block.

```scss
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
```

> **Named transitions with unique names** (e.g. `signout-flip`, `tab-slide-left`, `login-enter`) stay in the component that owns them, since they are not shared.

---

## Layer 3 — Component Styles (`<style scoped>`)

### When to use scoped styles

Use `<style scoped lang="scss">` for any style that:

- Is unique to the component
- References component-specific class names
- Overrides Quasar internals via `:deep()` for that component only

```scss
// AppListRow.vue <style scoped lang="scss">
.row-label {
  font-size: $font-body; // token from Layer 1
  color: $text-secondary; // token from Layer 1

  &--danger {
    color: $negative;
  }
}
```

### When to use `app.scss` instead

Move a style to `app.scss` if **any** of these are true:

- It is used by more than one unrelated component
- It is a `@keyframes` declaration (always global regardless of scoping)
- It is a Vue `<Transition>` name that is shared (`fade`, etc.)
- It overrides a Quasar global class (`body.q-ios-padding`, `.q-page`, `.q-page-container`)

### Token usage in components

All SCSS variables from `quasar.variables.scss` are available automatically. No `@use` or `@import` needed.

```scss
// ✅ correct — token from quasar.variables.scss
.my-section-header {
  font-size: $font-caption;
  color: $text-label;
  letter-spacing: $ls-label;
  text-transform: uppercase;
}

// ❌ avoid — hardcoded values
.my-section-header {
  font-size: 12px;
  color: rgba(235, 235, 245, 0.45);
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
```

---

## Design Decisions

### iOS Design Language

The entire token system is built to match iOS Human Interface Guidelines:

- **Colors** — system color values from iOS (`#0A84FF` blue, `#FF453A` red, `#30D158` green, `#FF9F0A` orange)
- **Typography** — iOS Dynamic Type sizes (17px body, 15px secondary, 34px large title)
- **Spacing** — 8pt grid (`$space-4` = 8px, `$space-8` = 16px)
- **Chrome heights** — 44px nav bar, 49px tab bar (exact iOS values)
- **Glass morphism** — `saturate(180%) blur(20px)` matches UIKit's vibrancy material

### Dark-only theme

The app is intentionally dark-only. All surface tokens are defined as `rgba(white, x)` over a black background, not as absolute colors. This means:

1. Surfaces are expressed as **transparency levels** over the background, not as hex values
2. Any future light mode would only need the background changed — surfaces would adapt automatically
3. Components never hardcode absolute dark colors for surfaces

The exception is the glass morphism chrome (`$glass-bg: rgba(28,28,30, 0.82)`) which references the dark surface color explicitly, since it must match the nav/tab bar visually.

### No CSS custom properties (yet)

Tokens live as SCSS variables, not CSS custom properties (`--color-primary`). This is intentional:

- **SCSS variables** are resolved at compile time — zero runtime overhead, works everywhere
- **CSS custom properties** enable runtime theming (e.g. switching themes without a page reload)

If a light mode or user-selectable theme is added in the future, the token system should be migrated to CSS custom properties declared on `:root`, with SCSS variables acting as fallbacks during the migration.

---

## Adding Styles — Decision Tree

```
Is this value used in multiple unrelated components?
├── Yes → define as a token in quasar.variables.scss
└── No  → keep hardcoded in the component, or add a token if it represents a
           semantic concept (e.g. $text-label, not $color-grey-45-percent)

Is this a @keyframes block?
├── Yes → put it in app.scss regardless of scope
└── No  → continue

Is this a Vue <Transition> class (e.g. .fade-enter-active)?
├── Shared across components → app.scss
└── Component-specific (e.g. .signout-flip-enter-active) → <style scoped>

Is this a Quasar global override (.q-page, body.q-ios-padding, etc.)?
├── Yes → app.scss
└── No  → <style scoped> with :deep() if needed

Is this a global page default (background, min-height)?
├── Same as all pages → already in app.scss, don't repeat it
└── This page deviates (dvh, flex layout, transparent) → <style scoped>
```

---

## Component Style Reference

### Core UI primitives

The following components form the iOS list system. Their styles define the visual baseline for all settings pages and any feature using an iOS-style list.

| Component        | Style scope | Key tokens used                                                                                                               |
| ---------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `AppListSection` | scoped      | `$surface-2`, `$surface-2-border`, `$radius-xl`, `$text-label`, `$ls-label`, `$font-caption`                                  |
| `AppListRow`     | scoped      | `$surface-press`, `$text-secondary`, `$text-disabled`, `$negative`, `$separator`, `$font-body`, `$font-caption`, `$radius-sm` |
| `AppListDivider` | scoped      | `$separator`, `$space-8`                                                                                                      |
| `SegmentControl` | scoped      | `$separator`, `$text-disabled`, `$text-primary`, `$font-body-sm`, `$transition-quick`                                         |

### Layout components

| Component    | Global styles | Scoped styles                                 |
| ------------ | ------------- | --------------------------------------------- |
| `MainLayout` | —             | Nav bar, tab bar, tab transitions, page stack |
| `AuthLayout` | —             | None (passthrough)                            |

### Core generic components

| Component          | Notes                                                 |
| ------------------ | ----------------------------------------------------- |
| `SplashOverlay`    | Uses `$z-splash`, `$surface-bg`, `$transition-bounce` |
| `LegalBottomSheet` | Uses `$glass-bg`, `$glass-blur-heavy`, full token set |
| `AppMenuDrawer`    | Global override (iOS padding) moved to `app.scss`     |
| `DeletionBanner`   | Uses `$negative` for danger color                     |

### Shared animations (defined in `app.scss`)

| Name       | Used by                                                          |
| ---------- | ---------------------------------------------------------------- |
| `shimmer`  | `CollectionPage`, `CatalogPage`, `CardsPage` skeleton loaders    |
| `ptr-spin` | `CollectionPage`, `CatalogPage` pull-to-refresh spinner          |
| `.fade-*`  | `LoginPage`, `DeleteAccountPage`, any `<Transition name="fade">` |
