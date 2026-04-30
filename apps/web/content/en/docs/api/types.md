---
title: Types
description: "Public TypeScript type aliases and interfaces."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

Public TypeScript type aliases and interfaces.

## AppPlatform

<small>type</small>

```ts
type AppPlatform = "ios" | "android" | "web"
```

---

## AppTabRoute

<small>interface</small>

```ts
interface AppTabRoute {
  badge?: number | Ref<number, number> | ComputedRef<number>
  cache?: boolean
  component?: () => Promise<{ default: Component }>
  componentName?: string
  icon: string
  labelKey: string
  name: string
  path: string
}
```

---

## AppTheme

<small>type</small>

```ts
type AppTheme = "light" | "dark" | "system"
```

---

## AuthBootOptions

<small>interface</small>

```ts
interface AuthBootOptions {
  apiBaseUrl?: string
  config: AppConfig
  onLogin?: (user: PublicUser) => void
  onLogout?: () => void
}
```

---

## AuthResponse

<small>interface</small>

```ts
interface AuthResponse {
  tokens: TokenPair
  user: PublicUser
}
```

---

## AuthRoutesConfig

<small>interface</small>

```ts
interface AuthRoutesConfig {
  login?: () => Promise<unknown>
  usernamePicker?: () => Promise<unknown>
}
```

---

## BuiltInSettingsSection

<small>type</small>

```ts
type BuiltInSettingsSection = "account" | "preferences" | "notifications" | "security" | "billing" | "support" | "legal" | "about"
```

---

## ClientBootFn

<small>type</small>

```ts
type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>
```

---

## DeviceInfo

<small>interface</small>

```ts
interface DeviceInfo {
  deviceId?: string
  deviceName?: string
  platform?: string
}
```

---

## EdgeSwipeBindings

<small>interface</small>

```ts
interface EdgeSwipeBindings {
  pointercancel: (e: PointerEvent) => void
  pointerdown: (e: PointerEvent) => void
  pointermove: (e: PointerEvent) => void
  pointerup: (e: PointerEvent) => void
}
```

---

## ForgotPasswordDto

<small>interface</small>

```ts
interface ForgotPasswordDto {
  email: string
  force?: boolean
}
```

---

## ForgotPasswordResult

<small>interface</small>

```ts
interface ForgotPasswordResult {
  expiresAt: string
  lastSentAt: string
}
```

---

## HapticEvent

<small>type</small>

Named haptic events mapped to the `@capacitor/haptics` primitive that best
matches the iOS Human Interface Guidelines for that interaction. Centralised
so the whole app speaks the same haptic vocabulary and the user's
`settings.haptics` preference is honoured everywhere.

```ts
type HapticEvent = "tab-switch" | "nav-push" | "nav-back" | "select" | "toggle" | "press" | "long-press" | "success" | "warning" | "error"
```

---

## I18nBootOptions

<small>interface</small>

```ts
interface I18nBootOptions {
  config?: AppConfig
  messages?: { en-US?: AnyMessages; es-ES?: AnyMessages; [locale: string]: AnyMessages | undefined }
}
```

---

## LoginDto

<small>interface</small>

```ts
interface LoginDto {
  deviceInfo?: DeviceInfo
  email: string
  password: string
}
```

---

## NavActionOptions

<small>interface</small>

```ts
interface NavActionOptions {
  icon: string
  label?: string
  onClick: () => void
}
```

---

## NotificationsBootOptions

<small>interface</small>

```ts
interface NotificationsBootOptions {
  onActionPerformed?: PushActionHandler
  onNotification?: PushNotificationHandler
}
```

---

## OAuthDto

<small>interface</small>

```ts
interface OAuthDto {
  deviceInfo?: DeviceInfo
  displayName?: string
  email?: string
  idToken: string
}
```

---

## PasswordStrength

<small>interface</small>

```ts
interface PasswordStrength {
  level: StrengthLevel
  pct: number
}
```

---

## PublicUser

<small>interface</small>

```ts
interface PublicUser {
  avatar?: string
  deletionScheduledAt?: string
  deletionStatus: "active" | "pending_deletion"
  displayName: string
  email: string
  id: string
  isEmailVerified: boolean
  providers: string[]
  role: string
  username?: string
  usernameChangedAt?: string
}
```

---

## PushActionHandler

<small>type</small>

```ts
type PushActionHandler = (action: ActionPerformed) => void
```

---

## PushNotificationHandler

<small>type</small>

```ts
type PushNotificationHandler = (notification: PushNotificationSchema) => void
```

---

## RegisterDto

<small>interface</small>

```ts
interface RegisterDto {
  email: string
  password: string
}
```

---

## ResetPasswordDto

<small>interface</small>

```ts
interface ResetPasswordDto {
  code: string
  email: string
  newPassword: string
}
```

---

## SettingsConfig

<small>interface</small>

```ts
interface SettingsConfig {
  customSections?: SettingsCustomSection[]
  sections?: BuiltInSettingsSection[]
}
```

---

## SettingsCustomSection

<small>interface</small>

```ts
interface SettingsCustomSection {
  component: () => Promise<unknown>
  name: string
  parentTitleKey?: string
  path: string
  titleKey: string
}
```

---

## StrengthLevel

<small>type</small>

```ts
type StrengthLevel = "weak" | "fair" | "good" | "strong"
```

---

## SynkosBootOptions

<small>interface</small>

```ts
interface SynkosBootOptions {
  apiBaseUrl?: string
  config: AppConfig
  messages?: { en-US?: AnyMessages; es-ES?: AnyMessages; [locale: string]: AnyMessages | undefined }
  notifications?: { onActionPerformed?: PushActionHandler; onNotification?: PushNotificationHandler }
  onLogin?: (user: PublicUser) => void
  onLogout?: () => void
}
```

---

## SynkosMessages

<small>type</small>

Merge utility: produces a type that combines core i18n keys with app-specific keys

```ts
type SynkosMessages = typeof coreEnUS & AppMessages
```

---

## SynkosRouterOptions

<small>interface</small>

```ts
interface SynkosRouterOptions {
  appTabRoutes: AppTabRoute[]
  authRoutes?: AuthRoutesConfig
  config: AppConfig
  notFoundComponent?: () => Promise<unknown>
  settingsConfig?: SettingsConfig
  stackNavigation?: boolean
  tabTransition?: TabTransitionMode
}
```

---

## SynkosSetupOptions

<small>interface</small>

```ts
interface SynkosSetupOptions {
  homeRouteName?: string
  loginRouteName?: string
  settingsConfig?: SettingsConfig
  stackNavigation?: boolean
  tabTransition?: TabTransitionMode
}
```

---

## TabMeta

<small>interface</small>

Declared inline on a route via meta.tab — alternative to AppTabRoute array

```ts
interface TabMeta {
  badge?: number | Ref<number, number> | ComputedRef<number>
  cache?: boolean
  componentName?: string
  icon: string
  labelKey: string
}
```

---

## TabTransitionMode

<small>type</small>

How tab-to-tab navigation animates inside MainLayout.

- `'push'` — horizontal slide between adjacent tabs (left/right based on
  index). The default since launch; closest to Material BottomNavigation.
- `'fade'` — crossfade between tabs. Closer to Apple's own apps which
  tend to use cuts or subtle dissolves rather than horizontal motion.
- `'none'` — instant cut, no animation. The most native-feeling option
  on iOS — UITabBarController itself does not animate tab swaps.

Sub-route push (e.g. /projects → /projects/:id) is unaffected by this
option and always uses the dedicated `nav-push-*` transitions.

```ts
type TabTransitionMode = "push" | "fade" | "none"
```

---

## TokenPair

<small>interface</small>

```ts
interface TokenPair {
  accessToken: string
  expiresIn: number
  refreshToken: string
}
```

---

## UseEdgeSwipeBackOptions

<small>interface</small>

Pointer-event handlers that implement the iOS edge-swipe-back gesture:
a horizontal swipe starting within `edgeWidth` pixels of the left edge
pops the current route when the swipe passes the distance or velocity
threshold. Bind the returned handlers to the element that owns the page
area (typically the slide wrapper inside `MainLayout`).

The composable does not animate the page mid-gesture — Vue Router's pop
+ the standard `nav-push-back` transition handle the visual on release.
Mid-drag tracking (the page following the finger) is a future
enhancement; the gesture as-is is already discoverable and feels close
to native on real devices.

```ts
interface UseEdgeSwipeBackOptions {
  edgeWidth?: number
  enabled?: () => boolean
  onSwipe?: () => void
  thresholdRatio?: number
  velocityThreshold?: number
}
```

**Example**

```ts
```ts
const edgeSwipe = useEdgeSwipeBack({ enabled: () => isSubRoute.value });
<div class="slide-wrapper" v-on="edgeSwipe.handlers">...</div>
```
```

---

## UsernameCheckResult

<small>interface</small>

```ts
interface UsernameCheckResult {
  available: boolean
  error: string | null
  errorMessage: string | null
  suggestions: string[]
  username: string
}
```

---

## UseTabStackResult

<small>interface</small>

Reactive view over the active tab's navigation stack. Use it to render
stack-depth-aware UI (a breadcrumb trail, a "back to top" button that
unwinds the whole stack at once) or to drive programmatic pops.

Requires `setupSynkosRouter({ stackNavigation: true })`. With stack
navigation disabled, `stack` is always `[]`, `canPop` is always
`false`, and `pop()` falls back to a classic `router.back()`.

```ts
interface UseTabStackResult {
  canPop: ComputedRef<boolean>
  depth: ComputedRef<number>
  stack: ComputedRef<readonly string[]>
  pop: unknown
}
```

**Example**

```ts
```ts
<script setup lang="ts">
import { useTabStack } from '@synkos/client'
const { stack, canPop, depth, pop } = useTabStack()
</script>

<template>
  <p>Depth in this tab: {{ depth }}</p>
  <AppButton :disabled="!canPop" @click="pop">Back</AppButton>
</template>
```
```
