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
