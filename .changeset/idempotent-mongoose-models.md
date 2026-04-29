---
'@synkos/server': patch
---

Make Mongoose model registration idempotent across subpath bundles.

`RefreshToken`, `AuditLog` and `ReservedUsername` now use the same `defineModel` helper
that the `User` model already used, so importing both `@synkos/server` and one of its
subpaths (e.g. `@synkos/server/middleware`) in the same process no longer throws
`OverwriteModelError: Cannot overwrite \`X\` model once compiled`.

Apps that worked around this by monkey-patching `mongoose.model` can drop that shim.
