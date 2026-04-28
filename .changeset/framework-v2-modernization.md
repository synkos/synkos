---
'@synkos/client': minor
'@synkos/ui': minor
'create-synkos': patch
---

Framework v2: headless auth, N-tab system, nav actions, settings opt-in, platform composable

**@synkos/client**

- `authRoutes` in `createSynkosRouter` — override login/username pages with your own components; package defaults remain for backwards compat
- `settingsConfig` in `createSynkosRouter` — opt-in to specific settings sections (`account`, `preferences`, `notifications`, `security`, `billing`, `support`, `legal`, `about`) and add custom sections
- MainLayout now reads `getTabConfig()` — supports N tabs (not hardcoded to 2), reactive badge counts via `AppTabRoute.badge`, keep-alive via `AppTabRoute.cache`
- `hideTabBar` route meta — hide the tab bar on specific routes
- `useNavAction({ icon, onClick })` — inject a trailing action into the nav bar from any page; cleans up automatically on unmount
- `usePlatform()` — returns `{ isIOS, isAndroid, isNative, isWeb, platform }`; boot now applies `data-platform` to `<html>`
- `LegalBottomSheet` and `getClientConfig` exported from public API (needed by user-owned auth pages)
- New types exported: `AuthRoutesConfig`, `SettingsConfig`, `SettingsCustomSection`, `BuiltInSettingsSection`

**@synkos/ui**

- `useBottomSheet(initialOpen?)` — headless composable: `{ isOpen, open, close, toggle, bindings }`
- `useDrawer(initialOpen?)` — headless composable: same API as `useBottomSheet`

**create-synkos**

- Template now includes editable auth pages at `src/pages/auth/LoginPage.vue` and `src/pages/auth/UsernamePage.vue`
- All auth page colors use CSS custom properties (`--auth-bg`, `--auth-text-primary`, `--color-primary`, etc.) — fully themeable without touching any package
- Auth tokens added to `src/css/dark.theme.scss` and `src/css/light.theme.scss`
- Router uses `authRoutes` to wire the template's own auth pages
