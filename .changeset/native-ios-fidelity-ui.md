---
'@synkos/ui': minor
---

Native iOS controls and behaviours that apps were previously forced to recreate or borrow Material variants for.

**`AppPage` now owns its own scroll** — every page cached via `<keep-alive>` keeps its own scroll position, matching iOS UITabBarController. AppPage also reports its scroll state to `MainLayout` so the nav bar can swap between transparent (at top) and glass (scrolled). Re-tapping the active tab smoothly scrolls the active AppPage to the top via an injected signal.

**Three new components:**

- **`AppSwitch`** (UISwitch) — 51 × 31 track, 27 px thumb that glides on the iOS push curve, system green fill when on, light haptic on flip. Slot it into `AppListRow`'s right slot for settings rows. Opt out of haptic via `:haptic="false"`.

- **`AppActionSheet`** (UIActionSheet) — bottom-anchored grouped list with a separated cancel button. Built on `AppBottomSheet`. Action `role` controls colour: `default` (system tint), `destructive` (red).

- **`AppAlert`** (UIAlertController) — centered 270 px card with title, message and 1-N action buttons. Side-by-side for ≤2 actions, stacked for ≥3. Default / cancel / destructive button roles map to the iOS visual conventions. Spring-ish scale-in via the same iOS curve, plain fade-out.

All three honour `prefers-reduced-motion` and degrade gracefully when `@capacitor/haptics` isn't available.
