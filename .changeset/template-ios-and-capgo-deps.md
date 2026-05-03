---
'@synkos/client': patch
'create-synkos': patch
---

Two fixes that close the "scaffold a Synkos app and `pnpm dev:ios` crashes / requires manual native config" gap.

**`@synkos/client` — promote `@capgo/*` plugins to dependencies.** `auth/store.ts` dynamic-imports `@capgo/capacitor-native-biometric` (biometric login) and `@capgo/capacitor-social-login` (Apple / Google sign-in). Both were left as "the consuming app installs them" — same gap we fixed for the `@capacitor/*` plugins last release. Apps that didn't install them got runtime errors the first time the auth flow tried to use Face ID or Sign in with Apple. Now they ship as direct deps of `@synkos/client`, so `pnpm install` brings everything the framework's auth flow needs.

**`create-synkos` — sane iOS template defaults.** The template's `Info.plist` was carrying `Grading Center` leftovers (the project this monorepo originally evolved from): hardcoded display name, a real Google client ID + URL scheme, and four usage descriptions for plugins Synkos doesn't bundle (camera, location, microphone, photo library). Worse, the template was missing the only key Synkos *does* need: `NSFaceIDUsageDescription` — so apps scaffolded via `pnpm create synkos` crashed with `attempted to access privacy-sensitive data without a usage description` the first time the user tried to sign in with Face ID.

Cleaned the template `Info.plist`:

- Removed contaminated keys (Google client ID, URL types, camera/location/microphone/photo descriptions).
- Replaced `Grading Center` with `{{APP_NAME}}` substitution so the user's chosen app name appears in the iOS bundle and in the Face ID prompt.
- Added `NSFaceIDUsageDescription` referencing `{{APP_NAME}}`.
- Replaced hardcoded `com.template.myapp` bundle ID in `project.pbxproj` with `{{BUNDLE_ID}}` so each scaffolded app gets its own.

Wired `Info.plist` and `project.pbxproj` into `create-synkos`'s `VARS_IN_CONTENT` allowlist so the substitutions actually fire at scaffold time. Documented in `sync-templates.mjs` that the iOS folder is hand-maintained in `templates/` (never auto-synced from `apps/frontend`) so dev-workspace contamination can't leak into shipped templates again.

Apps scaffolded with `pnpm create synkos` now boot on iOS sim out of the box, with a Face ID prompt that shows the user's actual app name and no `attempted to access privacy-sensitive data` crash.
