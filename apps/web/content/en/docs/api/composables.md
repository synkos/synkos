---
title: Composables
description: "Reactive primitives that drop into any component setup."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

Reactive primitives that drop into any component setup.

## useBottomSheet

<small>function</small>

```ts
function useBottomSheet(initialOpen: boolean): { bindings: ComputedRef<{ modelValue: boolean; onUpdate:modelValue: (v: boolean) => void }>; close: () => void; isOpen: Ref<boolean, boolean>; open: () => void; toggle: () => void }
```

---

## useDrawer

<small>function</small>

```ts
function useDrawer(initialOpen: boolean): { bindings: ComputedRef<{ modelValue: boolean; onUpdate:modelValue: (v: boolean) => void }>; close: () => void; isOpen: Ref<boolean, boolean>; open: () => void; toggle: () => void }
```

---

## useEdgeSwipeBack

<small>function</small>

```ts
function useEdgeSwipeBack(options: UseEdgeSwipeBackOptions): { handlers: EdgeSwipeBindings }
```

---

## useHaptic

<small>function</small>

Centralised haptic feedback helper. Honours the user's
`settings.haptics` preference and silently swallows runtime errors so a
missing or unsupported plugin can't break a UI flow.

```ts
function useHaptic(): { trigger: (event: HapticEvent) => void }
```

**Example**

```ts
```ts
const haptic = useHaptic();
function onSave() {
  haptic.trigger('press');
  await save();
  haptic.trigger('success');
}
```
```

---

## useNavAction

<small>function</small>

```ts
function useNavAction(options: NavActionOptions): void
```

---

## useNavTitle

<small>function</small>

```ts
function useNavTitle(title: string): void
```

---

## usePasswordStrength

<small>function</small>

```ts
function usePasswordStrength(password: Ref<string>): ComputedRef<PasswordStrength>
```

---

## usePlatform

<small>function</small>

```ts
function usePlatform(): { isAndroid: boolean; isIOS: boolean; isNative: boolean; isWeb: boolean; platform: AppPlatform }
```

---

## usePullToRefresh

<small>function</small>

```ts
function usePullToRefresh(onRefresh: () => Promise<void>): { arrowStyle: ComputedRef<{ opacity: string; transform: string }>; onTouchCancel: () => void; onTouchEnd: () => void; onTouchMove: (e: TouchEvent) => void; onTouchStart: (e: TouchEvent) => void; pullState: Ref<PullState, PullState>; wrapperStyle: ComputedRef<{ transform?: undefined; transition?: undefined; willChange?: undefined } | { transform: string; transition: string; willChange: string }> }
```

---

## useSettings

<small>function</small>

```ts
function useSettings(): { appLangs: ComputedRef<{ label: string; value: string }[]>; authStore: Store<"auth", Pick<{ accessToken: Ref<string | null, string | null>; biometricAsked: Ref<boolean, boolean>; biometricEnabled: Ref<boolean, boolean>; cancelDeletion: () => Promise<void>; changePassword: (currentPassword: string, newPassword: string) => Promise<void>; changeUsername: (rawUsername: string) => Promise<void>; continueAsGuest: () => Promise<void>; deletionScheduledAt: ComputedRef<Date | null>; disableBiometric: () => Promise<void>; enableBiometric: () => Promise<void>; hasAccount: ComputedRef<boolean>; initialize: () => Promise<InitResult>; isAuthenticated: ComputedRef<boolean>; isGuest: Ref<boolean, boolean>; isInitialized: Ref<boolean, boolean>; isLoading: Ref<boolean, boolean>; isPendingDeletion: ComputedRef<boolean>; loginApple: (dto: OAuthDto) => Promise<void>; loginEmail: (dto: LoginDto) => Promise<void>; loginGoogle: (dto: OAuthDto) => Promise<void>; logout: () => Promise<void>; markBiometricAsked: () => Promise<void>; refreshTokens: () => Promise<boolean>; register: (dto: RegisterDto) => Promise<void>; removePhoto: () => Promise<void>; requestDeletion: (password?: string) => Promise<{ scheduledAt: Date }>; setUsername: (rawUsername: string) => Promise<void>; updateName: (name: string) => Promise<void>; updatePhoto: (file: File) => Promise<void>; user: Ref<{ avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null, PublicUser | { avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null>; verifyEmail: (email: string, code: string) => Promise<void>; whenReady: () => Promise<InitResult> }, "user" | "accessToken" | "isGuest" | "isInitialized" | "isLoading" | "biometricEnabled" | "biometricAsked">, Pick<{ accessToken: Ref<string | null, string | null>; biometricAsked: Ref<boolean, boolean>; biometricEnabled: Ref<boolean, boolean>; cancelDeletion: () => Promise<void>; changePassword: (currentPassword: string, newPassword: string) => Promise<void>; changeUsername: (rawUsername: string) => Promise<void>; continueAsGuest: () => Promise<void>; deletionScheduledAt: ComputedRef<Date | null>; disableBiometric: () => Promise<void>; enableBiometric: () => Promise<void>; hasAccount: ComputedRef<boolean>; initialize: () => Promise<InitResult>; isAuthenticated: ComputedRef<boolean>; isGuest: Ref<boolean, boolean>; isInitialized: Ref<boolean, boolean>; isLoading: Ref<boolean, boolean>; isPendingDeletion: ComputedRef<boolean>; loginApple: (dto: OAuthDto) => Promise<void>; loginEmail: (dto: LoginDto) => Promise<void>; loginGoogle: (dto: OAuthDto) => Promise<void>; logout: () => Promise<void>; markBiometricAsked: () => Promise<void>; refreshTokens: () => Promise<boolean>; register: (dto: RegisterDto) => Promise<void>; removePhoto: () => Promise<void>; requestDeletion: (password?: string) => Promise<{ scheduledAt: Date }>; setUsername: (rawUsername: string) => Promise<void>; updateName: (name: string) => Promise<void>; updatePhoto: (file: File) => Promise<void>; user: Ref<{ avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null, PublicUser | { avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null>; verifyEmail: (email: string, code: string) => Promise<void>; whenReady: () => Promise<InitResult> }, "deletionScheduledAt" | "isAuthenticated" | "hasAccount" | "isPendingDeletion">, Pick<{ accessToken: Ref<string | null, string | null>; biometricAsked: Ref<boolean, boolean>; biometricEnabled: Ref<boolean, boolean>; cancelDeletion: () => Promise<void>; changePassword: (currentPassword: string, newPassword: string) => Promise<void>; changeUsername: (rawUsername: string) => Promise<void>; continueAsGuest: () => Promise<void>; deletionScheduledAt: ComputedRef<Date | null>; disableBiometric: () => Promise<void>; enableBiometric: () => Promise<void>; hasAccount: ComputedRef<boolean>; initialize: () => Promise<InitResult>; isAuthenticated: ComputedRef<boolean>; isGuest: Ref<boolean, boolean>; isInitialized: Ref<boolean, boolean>; isLoading: Ref<boolean, boolean>; isPendingDeletion: ComputedRef<boolean>; loginApple: (dto: OAuthDto) => Promise<void>; loginEmail: (dto: LoginDto) => Promise<void>; loginGoogle: (dto: OAuthDto) => Promise<void>; logout: () => Promise<void>; markBiometricAsked: () => Promise<void>; refreshTokens: () => Promise<boolean>; register: (dto: RegisterDto) => Promise<void>; removePhoto: () => Promise<void>; requestDeletion: (password?: string) => Promise<{ scheduledAt: Date }>; setUsername: (rawUsername: string) => Promise<void>; updateName: (name: string) => Promise<void>; updatePhoto: (file: File) => Promise<void>; user: Ref<{ avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null, PublicUser | { avatar?: string; deletionScheduledAt?: string; deletionStatus: "active" | "pending_deletion"; displayName: string; email: string; id: string; isEmailVerified: boolean; providers: string[]; role: string; username?: string; usernameChangedAt?: string } | null>; verifyEmail: (email: string, code: string) => Promise<void>; whenReady: () => Promise<InitResult> }, "initialize" | "whenReady" | "register" | "loginEmail" | "loginGoogle" | "loginApple" | "refreshTokens" | "logout" | "continueAsGuest" | "verifyEmail" | "enableBiometric" | "disableBiometric" | "markBiometricAsked" | "requestDeletion" | "cancelDeletion" | "setUsername" | "changeUsername" | "updateName" | "updatePhoto" | "removePhoto" | "changePassword">>; goToDeleteAccount: () => void; onTogglePush: (value: boolean) => Promise<void>; osDenied: Ref<boolean, boolean>; settingsStore: Store<"settings", Pick<{ appLang: Ref<string, string>; haptics: Ref<boolean, boolean>; pushNotificationsEnabled: Ref<boolean, boolean>; setAppLang: (lang: string) => void; setHaptics: (value: boolean) => void; setPushNotificationsEnabled: (value: boolean) => Promise<void>; setTheme: (value: AppTheme) => void; theme: Ref<AppTheme, AppTheme> }, "appLang" | "haptics" | "pushNotificationsEnabled" | "theme">, Pick<{ appLang: Ref<string, string>; haptics: Ref<boolean, boolean>; pushNotificationsEnabled: Ref<boolean, boolean>; setAppLang: (lang: string) => void; setHaptics: (value: boolean) => void; setPushNotificationsEnabled: (value: boolean) => Promise<void>; setTheme: (value: AppTheme) => void; theme: Ref<AppTheme, AppTheme> }, never>, Pick<{ appLang: Ref<string, string>; haptics: Ref<boolean, boolean>; pushNotificationsEnabled: Ref<boolean, boolean>; setAppLang: (lang: string) => void; setHaptics: (value: boolean) => void; setPushNotificationsEnabled: (value: boolean) => Promise<void>; setTheme: (value: AppTheme) => void; theme: Ref<AppTheme, AppTheme> }, "setAppLang" | "setHaptics" | "setPushNotificationsEnabled" | "setTheme">>; togglingPush: Ref<boolean, boolean> }
```

---

## useSheetDrag

<small>function</small>

```ts
function useSheetDrag(): { onDragEnd: () => void; onDragMove: (e: TouchEvent) => void; onDragStart: (e: TouchEvent) => void; sheetDragStyle: ComputedRef<{ transform: string; transition: string }> }
```

---

## useSignOut

<small>function</small>

```ts
function useSignOut(): { confirm: () => Promise<void>; isProcessing: Ref<boolean, boolean>; open: () => void; showDialog: Ref<boolean, boolean>; state: Ref<"confirm" | "farewell", "confirm" | "farewell">; wasGuest: Ref<boolean, boolean> }
```

---

## useTabStack

<small>function</small>

```ts
function useTabStack(): UseTabStackResult
```

---

## useTheme

<small>function</small>

```ts
function useTheme(): { applyTheme: (theme: AppTheme) => void }
```
