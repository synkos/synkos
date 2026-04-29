---
title: Services
description: "Stateless service objects for HTTP and platform integrations."
---

<!-- AUTO-GENERATED — Do not edit. Run `pnpm sync:docs` to regenerate. -->

Stateless service objects for HTTP and platform integrations.

## AccountService

<small>const</small>

```ts
const AccountService: { cancelDeletion: any; requestDeletion: any }
```

---

## AuthService

<small>const</small>

```ts
const AuthService: { forgotPassword: any; getMe: any; loginApple: any; loginEmail: any; loginGoogle: any; logout: any; refresh: any; register: any; resetPassword: any; sendVerificationEmail: any; validateResetCode: any; verifyEmail: any }
```

---

## createApiClient

<small>function</small>

```ts
function createApiClient(baseURL: string): AxiosInstance
```

---

## getApiClient

<small>function</small>

```ts
function getApiClient(): AxiosInstance
```

---

## notificationsService

<small>const</small>

```ts
const notificationsService: NotificationsService
```

---

## UsernameService

<small>const</small>

```ts
const UsernameService: { changeUsername: any; check: any; setUsername: any }
```

---

## UserService

<small>const</small>

```ts
const UserService: { registerPushToken: any; removePhoto: any; unregisterPushToken: any; updateName: any; updatePassword: any; updatePhoto: any }
```
