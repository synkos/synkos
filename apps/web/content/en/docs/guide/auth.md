---
title: Authentication
description: Email + OTP, social login, biometric unlock and account management.
order: 2
---

Synkos ships a complete authentication layer: a Pinia store, a set of services, biometric unlock, social providers, and editable pages for every flow. This guide explains the moving parts and how to wire them to your backend.

## What you get

- A session store (`useAuthStore`) with `user`, `tokens`, and lifecycle methods.
- HTTP services (`AuthService`, `UserService`, `AccountService`, `UsernameService`).
- Biometric unlock via `@capgo/capacitor-native-biometric`.
- Social login via `@capgo/capacitor-social-login` (Google, Apple).
- A 401-aware Axios client with automatic token refresh.
- User-owned, editable pages for login, OTP, username pick, account hub, password change, deletion.

## Anatomy of a session

The auth store keeps the session in memory and persists tokens to `@capacitor/preferences`:

```ts
import { useAuthStore } from '@synkos/client'

const auth = useAuthStore()

auth.user            // ref<PublicUser | null>
auth.isAuthenticated // computed: boolean
auth.signIn({ ... })
auth.signOut()
```

The `Tokens` are an access/refresh pair. The Axios client injects the access token into every request and, when the server returns `401`, calls the refresh endpoint, retries the original request, and surfaces failures to the caller.

## Backend contract

Synkos expects your backend to expose a small set of REST endpoints. The shape is intentionally narrow:

| Endpoint                     | Purpose                               | Service method               |
| ---------------------------- | ------------------------------------- | ---------------------------- |
| `POST /auth/register`        | Create account with email + password  | `AuthService.register`       |
| `POST /auth/login`           | Email + password sign-in              | `AuthService.login`          |
| `POST /auth/refresh`         | Exchange refresh for new access token | `AuthService.refresh`        |
| `POST /auth/forgot-password` | Trigger reset email/OTP               | `AuthService.forgotPassword` |
| `POST /auth/reset-password`  | Confirm reset with OTP                | `AuthService.resetPassword`  |
| `POST /auth/oauth/:provider` | Exchange OAuth token for session      | `AuthService.oauth`          |
| `GET /me`                    | Fetch current user                    | `UserService.me`             |
| `PATCH /me`                  | Update profile                        | `UserService.update`         |
| `DELETE /account`            | Delete account                        | `AccountService.delete`      |
| `POST /username/check`       | Validate availability                 | `UsernameService.check`      |

Types for request and response payloads (`RegisterDto`, `LoginDto`, `AuthResponse`, …) are exported from `@synkos/client`.

## Configuration

In `src/app.config.ts`, declare which providers you support and the API base URL:

```ts
import { defineAppConfig } from 'synkos';

export default defineAppConfig({
  identity: {
    name: 'My App',
    bundleId: 'com.myco.app',
  },
  api: {
    baseUrl: 'https://api.myco.app',
  },
  features: {
    socialLogin: ['google', 'apple'],
    biometric: true,
    pushNotifications: true,
  },
});
```

For social login, drop the provider client IDs in `.env`:

```bash
VITE_GOOGLE_CLIENT_ID=...
VITE_APPLE_SERVICE_ID=...
```

## Sign-in flows

### Email + password

```ts
const auth = useAuthStore();

async function onSubmit({ email, password }) {
  try {
    await auth.signIn({ email, password });
    router.push({ name: 'home' });
  } catch (err) {
    // err.code is one of 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'NETWORK'
    setError(err.message);
  }
}
```

### Email + OTP (passwordless)

The default `LoginPage.vue` ships with this flow already wired:

1. User enters email
2. `AuthService.requestOtp({ email })` triggers the email
3. User enters the 6-digit code
4. `auth.signInWithOtp({ email, code })` exchanges the code for a session

### Social login

```ts
import { useAuthStore } from '@synkos/client';

const auth = useAuthStore();

async function signInWithGoogle() {
  await auth.signInWithProvider('google');
}
```

Provider-specific setup (URL schemes, plist entries, AndroidManifest changes) is documented in [`@capgo/capacitor-social-login`](https://github.com/Cap-go/capacitor-social-login).

### Biometric unlock

After a successful password or OTP sign-in, the auth store offers to enable biometric unlock. Subsequent app opens use `BiometricAuth.verifyIdentity()` to re-establish the session without re-entering credentials. This is fully handled by the framework — your code only checks `auth.isAuthenticated`.

## Sign-out

```ts
import { useSignOut } from '@synkos/client';

const signOut = useSignOut();
await signOut(); // plays farewell animation, clears tokens, navigates to /auth/login
```

`useSignOut` wraps `auth.signOut()` with the platform-aware UI flow (overlay + animation). Prefer it inside settings pages.

## Account management

The `AccountService` covers the operations users expect:

- `AccountService.changePassword({ currentPassword, newPassword })`
- `AccountService.changeEmail({ newEmail })`
- `AccountService.delete({ confirmationToken })`

These are called from the editable settings pages under `src/pages/settings/account/`. You can replace those pages entirely without touching the framework.

## Username picker

If your app uses unique usernames, the framework includes a first-time picker:

- After first sign-up, the user lands on `UsernamePage`.
- `UsernameService.check({ candidate })` debounces requests and returns availability.
- Once chosen, `UserService.update({ username })` persists it.

The page is yours: edit `src/pages/auth/UsernamePage.vue`.

## Custom claims

If your backend stores extra fields on the user (roles, plan, feature flags), extend the `PublicUser` type in your project:

```ts
// src/types/user.d.ts
import '@synkos/client';

declare module '@synkos/client' {
  interface PublicUser {
    plan?: 'free' | 'pro';
    roles?: string[];
  }
}
```

The store will surface them on `auth.user` with full type safety.

## Common patterns

### Gating UI on auth state

```vue
<script setup lang="ts">
import { useAuthStore } from '@synkos/client';
const auth = useAuthStore();
</script>

<template>
  <AppButton v-if="auth.isAuthenticated" @click="action">Continue</AppButton>
  <AppButton v-else to="/auth/login">Sign in to continue</AppButton>
</template>
```

### Reacting to sign-in

```ts
import { watch } from 'vue';
import { useAuthStore } from '@synkos/client';

const auth = useAuthStore();
watch(
  () => auth.user?.id,
  (id) => {
    if (id) trackUserSignedIn(id);
  }
);
```

### Calling protected endpoints

```ts
import { getApiClient } from '@synkos/client';

const api = getApiClient();
const { data } = await api.get('/messages'); // access token injected automatically
```

## Next steps

- [Capacitor](/docs/guide/capacitor) — biometric and social login plugin setup
- [Routing](/docs/guide/routing) — how the auth guard wires to your routes
