---
'@synkos/ui': minor
---

iOS-native UX additions:

- **`IOSSheet`** — richer iOS 15+ sheet presentation (drag-to-dismiss with continued slide-off, drag handle, glass backdrop with **dynamic blur that intensifies as the sheet is pulled down**, header pattern with cancel / title / confirm, and named slots `belowHeader` / `footer` for sticky search bars and primary-action toolbars). Use it for picker sheets and multi-step flows; `AppBottomSheet` remains the bare primitive.
- **`IOSSpinner`** — native-style 12-bar `UIActivityIndicatorView` rendition with a 1 s linear fade ripple. Reach for it whenever you'd otherwise use `AppSpinner` and the surrounding chrome is iOS-shaped.
- **`AppPageLargeTitle`** — bumped the bottom padding from `0` to `$space-8` so the large title no longer butts against the first content row, matching iOS list spacing.
