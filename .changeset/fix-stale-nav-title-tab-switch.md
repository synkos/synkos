---
'@synkos/client': patch
'@synkos/ui': patch
---

Fix the stale nav-bar title that briefly showed the previous page's title on tab switches (and lingered on keep-alive return).

Two bugs combined:

1. **`<router-view>` swap order.** Vue mounts the new component (running its `setup`) *before* unmounting the old one. So the entering page's `setNavTitle('B')` ran first, then the leaving page's `onUnmounted` blanked the title back to `null` — every navigation flashed the fallback title.
2. **`<keep-alive>` doesn't fire `onUnmounted`.** Returning to a cached tab whose `useNavTitle('A')` lived in `<script setup>` left the global state showing whichever title the last visited page set.

Both are fixed by giving every `useNavTitle` / `useNavAction` / `AppPageLargeTitle` instance its own owner symbol. `setNavTitle(null, owner)` only clears when `owner` still owns the current value, so the leaving page's late cleanup is a no-op once the entering page has set its own title. `useNavTitle`, `useNavAction` and `AppPageLargeTitle` also wire `onActivated` (re-apply / re-attach `IntersectionObserver`) and `onDeactivated` (clear) so the keep-alive cycle is handled symmetrically.

The `synkos:set-nav-title` inject token signature gains an optional second arg (`owner?: symbol`) — additive, old consumers keep working.
