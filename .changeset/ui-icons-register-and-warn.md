---
'@synkos/ui': minor
---

Make missing icons impossible to miss in dev, and let apps extend the catalog:

- Built-in catalog grew from ~28 to ~50 names — common app needs like
  `dashboard`, `folder`, `add`, `edit`, `event`, `link`, `terminal`,
  `auto_awesome`, etc. are now rendered without any registration.

- New `registerIcons(map)` export merges custom SVG paths into the registry.
  Apps can ship a single `boot/icons.ts` that registers everything they need
  in one place, instead of monkey-patching the exported `icons` object.

- `getIcon(name)` for an unknown name now (a) renders a visible
  `help_outline` glyph instead of an empty `<svg>`, and (b) emits a one-shot
  `console.warn` in dev with the exact `registerIcons({ name: '...' })` call
  to add. This turns a silent failure (UI looks fine, icon doesn't show)
  into an immediately diagnosable one.

The fallback change is technically a behavior change — apps that intentionally
relied on missing icons rendering as empty should call `registerIcons({ X: '' })`.
