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
- `stackNavigation: boolean` — default `false`. Enables the full iOS `UITabBarController` model: each tab gets its own navigation stack tracked in memory. Forward navigation appends, re-entry to a previously-visited path truncates, switching back to a previously-visited tab restores the top of its stack, and `MainLayout.goBack()` / the edge-swipe-back gesture pop the active tab's stack (using `router.replace()`) instead of hitting Vue Router's global history. A new `useTabStack()` composable exposes the active tab's stack reactively (`stack`, `canPop`, `depth`, `pop()`) for stack-aware UI.

**New slots on `MainLayout`:**

- `header-left`, `header-center`, `header-right`, `tab-bar`. Each ships with the existing rendering as the default. Scoped slot props expose the values needed to replicate or extend behaviour without re-reading state.

**Capacitor plugins are now framework dependencies.** Synkos uses Capacitor plugins internally — `@capacitor/haptics` is fired statically across the app, `@capacitor/preferences` is imported by the auth store, `@capacitor/keyboard` and `@capacitor/status-bar` drive the new keyboard / theme behaviours. They were previously expected to be installed by the consuming app, which made it easy to forget one and hit a runtime error or a missing feature. They're now declared as `dependencies` of `@synkos/client`, so `pnpm install @synkos/client` brings everything Synkos needs:

- `@capacitor/app`
- `@capacitor/haptics`
- `@capacitor/keyboard`
- `@capacitor/preferences`
- `@capacitor/push-notifications`
- `@capacitor/splash-screen`
- `@capacitor/status-bar`

`@capacitor/core` stays as a peer dependency — the native bridge is per-app and the consumer must own its version.

**Migration:** apps can drop these from their own `package.json` if they don't import them directly; pnpm will dedupe automatically. Apps that import Capacitor plugins themselves (e.g. `import { Haptics } from '@capacitor/haptics'`) should keep them as direct dependencies for clarity.
