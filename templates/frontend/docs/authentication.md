# TGC App — Authentication

## Table of Contents

- [Overview](#overview)
- [Auth State Machine](#auth-state-machine)
- [File Structure](#file-structure)
- [Auth Store](#auth-store)
  - [State](#state)
  - [Computed](#computed)
  - [Actions](#actions)
- [Token Storage](#token-storage)
- [API Client — JWT Interceptors](#api-client--jwt-interceptors)
- [Boot Initialization](#boot-initialization)
- [Router Guards](#router-guards)
- [Login Screen](#login-screen)
  - [Sign-in modes](#sign-in-modes)
  - [Email / Password](#email--password)
  - [Google Sign-In](#google-sign-in)
  - [Apple Sign-In](#apple-sign-in)
  - [Guest mode](#guest-mode)
  - [Face ID](#face-id)
- [Profile Page](#profile-page)
- [i18n Keys](#i18n-keys)
- [Native Plugin Setup](#native-plugin-setup)
  - [Google](#google)
  - [Apple](#apple)
  - [@capacitor/preferences](#capacitorpreferences)
- [Security Decisions](#security-decisions)
- [Adding a Protected Feature](#adding-a-protected-feature)

---

## Overview

The authentication flow has three possible states when the app launches:

| State               | Description                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Authenticated**   | User has a valid session (access token in memory, refresh token in Keychain). Full access to all features.                     |
| **Guest**           | User explicitly chose "Continue without signing in". Limited access — features that require an account show an upgrade prompt. |
| **Unauthenticated** | No session and no guest flag. App redirects to the login screen.                                                               |

All state is managed by a single Pinia store (`auth.store.ts`). The access token is **in-memory only** — it survives navigation but is lost on app close. On the next launch, the stored refresh token (iOS Keychain) is used to silently restore the session before the app renders.

---

## Auth State Machine

```
                       App launch
                           │
                           ▼
                   auth.store.initialize()
                           │
              ┌────────────┼────────────┐
              │            │            │
        guestFlag       refreshToken    (nothing)
           = true         found          stored
              │            │            │
              ▼            ▼            ▼
         isGuest=true  POST /auth/    LoginPage
                        refresh         shown
                           │
                    ┌──────┴──────┐
                    │             │
                 success        failure
                    │             │
                    ▼             ▼
              user loaded    clearToken
              → main app     → LoginPage


         LoginPage actions:
           ┌──────────────────┐
           │ Sign in (email)  │──→ POST /auth/login   ──→ setSession → main app
           │ Continue Google  │──→ GoogleAuth.signIn() → POST /auth/google → setSession → main app
           │ Continue Apple   │──→ Apple.authorize()  ──→ POST /auth/apple → setSession → main app
           │ Continue as guest│──→ isGuest = true     ──→ main app
           └──────────────────┘
                   │
                   ▼ (after any successful sign-in)
           biometricEnabled?
            No → offer Face ID prompt → user enables or skips → main app
            Yes → main app directly
```

---

## File Structure

```
src/
├── boot/
│   └── auth.ts                  ← runs before app renders; calls store.initialize()
├── stores/
│   └── auth.store.ts            ← single source of truth for all auth state
├── services/
│   ├── api.ts                   ← Axios instance with JWT request/response interceptors
│   └── auth.service.ts          ← HTTP wrappers for /auth/* endpoints
├── types/
│   └── auth.ts                  ← TypeScript interfaces (PublicUser, TokenPair, etc.)
├── pages/
│   └── LoginPage.vue            ← full-screen auth UI (login + register + Face ID prompt)
└── router/
    ├── routes.ts                ← /login route defined without MainLayout
    └── index.ts                 ← global navigation guard
```

---

## Auth Store

**File:** [`src/stores/auth.store.ts`](../src/stores/auth.store.ts)

### State

```typescript
const user = ref<PublicUser | null>(null);
// Populated after login. null = not authenticated.

const accessToken = ref<string | null>(null);
// In-memory JWT. Never written to disk. Lost on app close and restored via refresh.

const isGuest = ref(false);
// true = user chose "Continue without signing in". Persisted to @capacitor/preferences.

const isInitialized = ref(false);
// false while the boot file is checking stored tokens. Used to show a splash screen.

const isLoading = ref(false);
// true during any auth API call. Used to disable form buttons.

const biometricEnabled = ref(false);
// true if the user has opted in to Face ID. Persisted to @capacitor/preferences.
```

### Computed

```typescript
const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
// true only when both user and a live access token are present.

const hasAccount = computed(() => isAuthenticated.value);
// Alias — use where the intent is "does this user have an account vs. guest".
```

### Actions

| Action               | Description                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize()`       | Called once at boot. Checks stored guest flag and refresh token; restores session if possible. Sets `isInitialized = true` when done.  |
| `register(dto)`      | Calls `POST /auth/register`. Saves refresh token to Keychain, sets session.                                                            |
| `loginEmail(dto)`    | Calls `POST /auth/login`. Saves refresh token to Keychain, sets session.                                                               |
| `loginGoogle(dto)`   | Calls `POST /auth/google`. Saves refresh token to Keychain, sets session.                                                              |
| `loginApple(dto)`    | Calls `POST /auth/apple`. Saves refresh token to Keychain, sets session.                                                               |
| `refreshTokens()`    | Calls `POST /auth/refresh` with stored token. Rotates both tokens. Returns `false` on failure. Called by the Axios interceptor on 401. |
| `logout()`           | Revokes refresh token on server, clears Keychain entry, clears in-memory state.                                                        |
| `continueAsGuest()`  | Sets `isGuest = true`, persists the flag to `@capacitor/preferences`.                                                                  |
| `enableBiometric()`  | Persists biometric flag. Does not trigger native biometric prompt — that happens on next launch.                                       |
| `disableBiometric()` | Removes biometric flag from storage.                                                                                                   |

---

## Token Storage

| Token              | Where stored                                               | Why                                                                                                                                             |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Access token**   | `ref<string>` in Pinia store (memory)                      | Never touches disk. Expires in 15 min. If the app is killed, it is gone — harmless.                                                             |
| **Refresh token**  | `@capacitor/preferences` under key `tgc-refresh-token`     | On iOS native builds, this maps to the **iOS Keychain** (encrypted, app-scoped, survives reinstall). On web/dev, it falls back to localStorage. |
| **Guest flag**     | `@capacitor/preferences` under key `tgc-guest`             | Lightweight boolean; Keychain is fine but Preferences works just as well.                                                                       |
| **Biometric flag** | `@capacitor/preferences` under key `tgc-biometric-enabled` | Same as guest flag.                                                                                                                             |

**Why not store the access token in Keychain?**

The access token is short-lived (15 minutes). The Keychain is reserved for long-lived secrets. Keeping the access token in memory forces the app to always go through a refresh on cold start — which also validates that the session is still active on the server.

**Preference keys:**

```typescript
const REFRESH_TOKEN_KEY = 'tgc-refresh-token';
const GUEST_KEY = 'tgc-guest';
const BIOMETRIC_ENABLED_KEY = 'tgc-biometric-enabled';
```

---

## API Client — JWT Interceptors

**File:** [`src/services/api.ts`](../src/services/api.ts)

### Request interceptor — inject access token

Reads the access token from the Pinia store's raw state (avoiding a circular import) and injects it as a Bearer header on every request:

```typescript
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // reads window.__pinia.state.value.auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

The `getAccessToken()` helper reads directly from Pinia's internal state object to avoid a module-level circular import between `api.ts` and `auth.store.ts`.

### Response interceptor — silent refresh on 401

When a request returns `401` (access token expired), the interceptor automatically:

1. Pauses any parallel requests (queues them).
2. Calls `authStore.refreshTokens()`.
3. Retries all queued requests with the new token.
4. If refresh fails → calls `authStore.logout()` and discards queued requests.

```
Request → 401 (expired token)
  │
  ├── isRefreshing = false (first 401)
  │     ├── isRefreshing = true
  │     ├── POST /auth/refresh
  │     │     ├── success → new accessToken in store
  │     │     │             retry original request
  │     │     │             flush queue with new token
  │     │     └── failure → logout() → queue rejected
  │     └── isRefreshing = false
  │
  └── isRefreshing = true (concurrent 401s)
        └── queued → resolved when refresh completes
```

**This is transparent to all other services and stores** — `cards.service.ts`, `collections.service.ts`, etc. do not need to know about token expiry.

---

## Boot Initialization

**File:** [`src/boot/auth.ts`](../src/boot/auth.ts)

```typescript
export default defineBoot(async () => {
  const authStore = useAuthStore();
  await authStore.initialize();
});
```

Registered in `quasar.config.ts` as:

```typescript
boot: ['i18n', 'auth'];
```

**Order matters:** `i18n` must be before `auth` because the login page uses translations.

`initialize()` runs before the router renders any component. This ensures that by the time the navigation guard runs, `authStore.isInitialized` is already `true` and `authStore.isAuthenticated` / `authStore.isGuest` reflect the real session state.

If `initialize()` were not `await`ed, the router guard would run before the refresh token check completes — incorrectly redirecting authenticated users to the login page on every cold start.

---

## Router Guards

**File:** [`src/router/index.ts`](../src/router/index.ts)

A single global `beforeEach` guard handles all auth routing:

```typescript
Router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Authenticated or guest already have a session → skip the login screen
  if (to.name === 'login' && (authStore.isAuthenticated || authStore.isGuest)) {
    return { name: 'home' };
  }

  return true;
});
```

**All routes are public.** The login screen is only shown when the user navigates to `/login` explicitly (e.g. from the Profile page "Sign In" button). Guest users can browse the full app — individual features will show an upgrade prompt when they require an account.

---

## Login Screen

**File:** [`src/pages/LoginPage.vue`](../src/pages/LoginPage.vue)

A full-screen page (no `MainLayout` wrapper) designed to match iOS native aesthetics: dark background, SF Pro-like typography, native button styles, and system-level transitions.

### Sign-in modes

The page has two modes toggled with a `ref<'login' | 'register'>`. Switching animates with a horizontal slide transition (`translateX`). Both modes share the same `form` ref object to preserve typed values when toggling.

### Email / Password

**Login:**

1. Validates email format and non-empty password.
2. Calls `authStore.loginEmail({ email, password })`.
3. On success → `afterAuth()`.
4. On `401` → shows "Incorrect email or password."
5. On any other error → shows generic error message.

**Register:**

1. Validates name (≥ 2 chars), email format, password requirements.
2. Shows a live password strength indicator (weak / fair / good / strong).
3. Calls `authStore.register({ email, password, displayName })`.
4. On success → `afterAuth()`.
5. On `409` → shows "An account with this email already exists."

Password strength scoring (0–5):

| Points | Level          |
| ------ | -------------- |
| ≤ 1    | Weak (red)     |
| 2      | Fair (orange)  |
| 3      | Good (green)   |
| 4–5    | Strong (green) |

Scoring criteria: length ≥ 8, length ≥ 12, has uppercase, has digit, has special character.

### Google Sign-In

```typescript
const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
const googleUser = await GoogleAuth.signIn();
await authStore.loginGoogle({ idToken: googleUser.authentication.idToken });
```

The `idToken` is sent to `POST /auth/google` for server-side verification. The client never processes the token — all validation happens on the API.

User-cancelled sign-ins (error messages containing "cancel" / "12501") are silently ignored — no error is shown.

### Apple Sign-In

```typescript
const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
const result = await SignInWithApple.authorize({
  clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
  redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI,
  scopes: 'email name',
  nonce: crypto.randomUUID(),
});
await authStore.loginApple({
  idToken: result.response.identityToken,
  email: result.response.email, // null on repeat sign-ins
  displayName: result.response.givenName + ' ' + result.response.familyName,
});
```

A random `nonce` is generated per request using `crypto.randomUUID()`. This prevents replay attacks — the Apple token includes the nonce and the server can verify it matches.

**Handling Apple's first-time-only email:**

Apple only includes `email` and `givenName`/`familyName` in the authorization response on the **first** sign-in for a given Apple ID. On subsequent sign-ins, these fields are `null`. The server handles this by looking up the user by `providers.providerId` (Apple's user ID, which is always present) rather than by email.

### Guest mode

```typescript
await authStore.continueAsGuest();
router.replace({ name: 'home' });
```

A `tgc-guest: "true"` entry is written to `@capacitor/preferences`. On the next launch, `initialize()` reads this flag and sets `isGuest = true` without attempting a token refresh.

### Face ID

After a successful sign-in, `afterAuth()` is called:

```typescript
async function afterAuth() {
  if (!authStore.biometricEnabled) {
    showBiometricPrompt.value = true; // show the Face ID offer sheet
  } else {
    router.replace({ name: 'home' });
  }
}
```

The Face ID prompt is a bottom sheet `q-dialog`. Accepting calls `authStore.enableBiometric()` which writes `tgc-biometric-enabled: "true"` to Preferences. The actual biometric authentication on subsequent launches requires integrating `@aparajita/capacitor-biometric-auth` or `capacitor-native-biometric` — the store has the `biometricEnabled` flag and `enableBiometric()` / `disableBiometric()` actions ready; only the native prompt on app launch needs to be wired up.

**Planned biometric launch flow (to implement):**

```typescript
// In auth.store.initialize():
if (biometricEnabled && !isGuest) {
  const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth');
  const available = await BiometricAuth.checkBiometry();
  if (available.isAvailable) {
    await BiometricAuth.authenticate({ reason: 'Sign in to TGC Grading' });
    // biometric passed → proceed with refresh token as usual
  }
}
```

---

## Profile Page

**File:** [`src/pages/ProfilePage.vue`](../src/pages/ProfilePage.vue)

The profile page is fully connected to the auth store:

| Element         | Authenticated                                      | Guest                             |
| --------------- | -------------------------------------------------- | --------------------------------- |
| Avatar          | Shows `user.avatar` image or person icon           | Person icon                       |
| Name            | `user.displayName`                                 | "My Profile" (i18n)               |
| Subtitle        | `user.email`                                       | "Sign in to sync your collection" |
| Top button      | (hidden)                                           | "Sign In" → navigates to `/login` |
| Provider badges | Lists linked providers (local, google, apple)      | (hidden)                          |
| Face ID toggle  | Visible, connected to `biometricEnabled`           | (hidden)                          |
| Sign Out button | Calls `authStore.logout()` → redirects to `/login` | "Exit guest mode" → same action   |

---

## i18n Keys

All auth-related strings live under `pages.auth`. Both `en-US` and `es-ES` are fully translated.

```typescript
// en-US (abbreviated)
pages: {
  auth: {
    tagline: 'The smartest way to grade your cards.',
    continueApple: 'Continue with Apple',
    continueGoogle: 'Continue with Google',
    orWith: 'or continue with email',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    newPasswordPlaceholder: 'Password (min. 8 characters)',
    namePlaceholder: 'Full name',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    noAccount: "Don't have an account?",
    createAccount: 'Create one',
    createAccountBtn: 'Create Account',
    continueGuest: 'Continue without signing in',
    faceIdTitle: 'Enable Face ID',
    faceIdDesc: 'Sign in faster and more securely with Face ID next time.',
    enableFaceId: 'Enable Face ID',
    notNow: 'Not Now',
    passwordStrength: { weak, fair, good, strong },
    errors: {
      invalidEmail, passwordRequired, passwordTooShort,
      passwordNeedsUpper, passwordNeedsNumber, nameRequired,
      invalidCredentials, emailTaken, googleFailed, appleFailed, generic,
    },
  },
}
```

Profile-related additions under `pages.profile`:

```typescript
exitGuest: 'Exit guest mode',
faceId: 'Face ID',
faceIdEnabled: 'Enabled — sign in without a password',
faceIdDisabled: 'Enable for faster sign-in',
```

---

## Native Plugin Setup

### Google

**Package:** `@codetrix-studio/capacitor-google-auth`

**iOS (Xcode):**

1. Add `GoogleService-Info.plist` (downloaded from Firebase / Google Cloud Console) to `App/App/`.
2. In `Info.plist`, add a URL scheme: `REVERSED_CLIENT_ID` value from `GoogleService-Info.plist`.
3. In `AppDelegate.swift`:

   ```swift
   import GoogleSignIn

   func application(_ app: UIApplication, open url: URL, options: ...) -> Bool {
     return GIDSignIn.sharedInstance.handle(url)
   }
   ```

4. In `capacitor.config.json`:
   ```json
   {
     "plugins": {
       "GoogleAuth": {
         "scopes": ["profile", "email"],
         "serverClientId": "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
         "forceCodeForRefreshToken": true
       }
     }
   }
   ```

**Environment variables:**

```bash
# tgc-app/.env
# (none needed — Google client ID is in capacitor.config.json)

# tgc-api/.env
GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

---

### Apple

**Package:** `@capacitor-community/apple-sign-in`

**iOS (Xcode):**

1. **Signing & Capabilities** → **+ Capability** → **Sign In with Apple**.
2. No additional code changes needed — the plugin handles the native call.

**Apple Developer Portal:**

1. Create a **Service ID** (for web-based flows and `audience` verification).
2. Configure the Service ID with your domain and redirect URI.

**Environment variables:**

```bash
# tgc-app/.env
VITE_APPLE_CLIENT_ID=com.yourcompany.tgcgrading
VITE_APPLE_REDIRECT_URI=https://yourapp.com/auth/apple/callback

# tgc-api/.env
APPLE_CLIENT_ID=com.yourcompany.tgcgrading.service
APPLE_TEAM_ID=ABCDEF1234
```

---

### @capacitor/preferences

No additional native configuration needed — ships with Capacitor and automatically uses:

- **iOS:** `NSUserDefaults` by default; for sensitive data (like the refresh token), configure Keychain groups in `capacitor.config.json`:
  ```json
  {
    "plugins": {
      "Preferences": {
        "group": "com.yourcompany.tgcgrading"
      }
    }
  }
  ```
- **Android:** `SharedPreferences` (consider using `EncryptedSharedPreferences` for additional security).
- **Web:** `localStorage`.

---

## Security Decisions

### Why is the access token in-memory only?

Storing JWTs in `localStorage` exposes them to XSS — any injected script can read and exfiltrate them. In a Quasar/Capacitor app, XSS risk is lower than in a standard web app (no third-party scripts, no CDN), but the principle still holds. Keeping the token in a Pinia `ref` ensures it never touches disk and is automatically cleared on app close.

### Why use @capacitor/preferences for the refresh token instead of localStorage?

On iOS native builds, `@capacitor/preferences` stores data in the iOS Keychain under the app's bundle ID. Keychain data:

- Is encrypted at rest by the OS.
- Is inaccessible to other apps.
- Survives app reinstalls (unless explicitly removed).
- Is backed up to iCloud only if you configure it to be (default: local only).

`localStorage` is stored in an unencrypted SQLite database in the app's sandboxed directory. While inaccessible to other apps, it is readable from a jailbroken device or from an iTunes backup without encryption.

### Why rotate refresh tokens?

If a refresh token is stolen and used by an attacker, the original user's next refresh call will submit a revoked token. The server rejects it (the attacker already rotated it). The user experiences a logout, realizes something is wrong, and can change their password.

Without rotation, a stolen refresh token is valid indefinitely until the user actively logs out from all devices.

---

## Adding a Protected Feature

### 1. Mark the route

```typescript
// src/router/routes.ts
{ path: 'wishlist', name: 'wishlist', component: ..., meta: { requiresAuth: true } }
```

The navigation guard will redirect unauthenticated users to `/login` automatically.

### 2. Show an upgrade prompt for guests (optional)

For features accessible to guests with limited functionality:

```vue
<template>
  <div v-if="!authStore.isAuthenticated" class="guest-banner">
    <p>Sign in to save your wishlist across devices.</p>
    <button @click="router.push('/login')">Sign In</button>
  </div>
  <!-- feature content -->
</template>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/auth.store';
const authStore = useAuthStore();
</script>
```

### 3. Call a protected API endpoint

The Axios interceptor handles token injection automatically. Just call the service:

```typescript
// src/services/wishlist.service.ts
import api from './api';

export const WishlistService = {
  async getWishlist() {
    // Authorization header is injected by the request interceptor
    const res = await api.get('/wishlist');
    return res.data.data;
  },
};
```

If the access token is expired, the response interceptor silently refreshes it and retries — no extra code needed.

### 4. Protect the API endpoint

```typescript
// tgc-api/src/modules/wishlist/wishlist.routes.ts
import { authenticate } from '@/middleware/authenticate';

router.get('/', authenticate, WishlistController.getWishlist);
router.post('/', authenticate, WishlistController.addItem);
router.delete('/:id', authenticate, WishlistController.removeItem);
```

Access `req.user._id` in the controller to scope the query to the authenticated user.
