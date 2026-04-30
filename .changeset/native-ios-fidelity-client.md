---
'@synkos/client': minor
---

Native iOS fidelity for `MainLayout` — fixes the "first tab change is jumpy" symptom and adds the UITabBar / UINavigationController behaviours that were missing.

**Bug fixes (no API change):**

- Tab transition direction is now decided by a `router.afterEach` guard comparing tab indices of `from` vs `to`. Every navigation source — tab tap, deep link, programmatic push, browser back — gets the right direction. The previous click-handler logic with a `setTimeout(350)` revert had a race condition under quick taps and ignored non-tap navigation.
- Permanent GPU layer promotion on the nav bar, tab bar and the page root. The first tab change no longer pays a one-frame layer-allocation cost from `backdrop-filter` and `will-change: transform` being toggled at animation start.
- `prefers-reduced-motion` collapses transitions to 0.01ms and disables the GPU layer hint.

**New behaviours, additive:**

- Per-page scroll. Each `AppPage` now owns its own scroll container so a tab cached via `<keep-alive>` keeps its scroll position across navigations — the iOS UITabBarController model. Previously the scroll lived on `.slide-wrapper` inside `MainLayout`, which leaked positions across tabs.
- Re-tap on the active tab → scroll to top (UITabBar gesture). Re-tap while inside a sub-route → pop to the tab root.
- Scroll-edge appearance. Nav bar is transparent at the top of the active page, glass once content scrolls. Matches `UINavigationBarAppearance.scrollEdgeAppearance`.
- Dedicated `nav-push-forward` / `nav-push-back` transitions for sub-route navigation, with the iOS `cubic-bezier(0.32, 0.72, 0, 1)` curve. Tab-to-tab still uses `tab-slide-*`; cold-mount and non-tab paths use `tab-fade`.
- iOS edge-swipe-back gesture via the new `useEdgeSwipeBack()` composable. Wired up by `MainLayout` on `.slide-wrapper` and gated to sub-routes only.
- Tab bar slides off-screen when the on-screen keyboard appears (`@capacitor/keyboard`).
- StatusBar style follows the active theme (`@capacitor/status-bar`) — system icons stay legible after a theme switch.
- `useHaptic()` composable centralises the haptic vocabulary (`tab-switch`, `select`, `success`, `error`, …) and honours the user's `settings.haptics` preference.

**New options on `setupSynkosRouter` / `createSynkosRouter`:**

- `tabTransition: 'push' | 'fade' | 'none'` — default `'push'` keeps current behaviour. `'fade'` matches Apple's own apps; `'none'` is the most native iOS feel (UITabBarController itself does not animate tab swaps).
- `preserveTabHistory: boolean` — default `false`. When enabled, switching back to a previously-visited tab restores its deepest visited path instead of going to the tab root, mirroring UITabBarController's per-tab navigation stacks.

**New slots on `MainLayout`:**

- `header-left`, `header-center`, `header-right`, `tab-bar`. Each ships with the existing rendering as the default. Scoped slot props expose the values needed to replicate or extend behaviour without re-reading state.

**Optional Capacitor plugins** — install only if you want the feature:

- `@capacitor/status-bar` for theme-aware status bar.
- `@capacitor/keyboard` for tab-bar-hides-with-keyboard.

If they're not installed, the related code path no-ops at runtime.
