import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from 'src/services/auth.service';
import { AccountService } from 'src/services/account.service';
import { UsernameService } from 'src/services/username.service';
import { UserService } from 'src/services/user.service';
import { notificationsService } from 'src/services/notifications.service';
import { appConfig } from 'src/app.config';

function flushPushToken() {
  // Dynamic import avoids circular dependency (settings.store → notifications.service → user.service)
  import('src/stores/settings.store')
    .then(({ useSettingsStore }) => {
      if (useSettingsStore().pushNotificationsEnabled) {
        void notificationsService.flushPendingToken();
      }
    })
    .catch(() => undefined);
}
import type { PublicUser, RegisterDto, LoginDto, OAuthDto } from 'src/types/auth';

const GUEST_KEY = 'tgc-guest';
const BIOMETRIC_ENABLED_KEY = 'tgc-biometric-enabled';
const BIOMETRIC_ASKED_KEY = 'tgc-biometric-asked'; // persists across logout — shown once ever
const USER_KEY = 'tgc-user';
const BACKGROUNDED_AT_KEY = 'tgc-backgrounded-at';
const AUTH_PROVIDER_KEY = 'tgc-auth-provider';

// Face ID is skipped if the app was backgrounded within this window
const BIOMETRIC_GRACE_MS = 15 * 60 * 1000; // 15 minutes

// ── Secure token storage (iOS Keychain via NativeBiometric) ──────────────────

const KEYCHAIN_SERVER = 'tgc.grader.app';
const KEYCHAIN_USER = 'refresh-token';

async function saveRefreshToken(token: string) {
  const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
  await NativeBiometric.setCredentials({
    server: KEYCHAIN_SERVER,
    username: KEYCHAIN_USER,
    password: token,
  });
}

async function loadRefreshToken(): Promise<string | null> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const { password } = await NativeBiometric.getCredentials({ server: KEYCHAIN_SERVER });
    return password ?? null;
  } catch {
    return null;
  }
}

async function clearRefreshToken() {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.deleteCredentials({ server: KEYCHAIN_SERVER });
  } catch {
    // No credentials stored — nothing to delete
  }
}

// ── User cache (non-sensitive — display data only) ────────────────────────────

async function saveUser(u: PublicUser) {
  await Preferences.set({ key: USER_KEY, value: JSON.stringify(u) });
}

async function loadUser(): Promise<PublicUser | null> {
  const { value } = await Preferences.get({ key: USER_KEY });
  if (!value) return null;
  try {
    return JSON.parse(value) as PublicUser;
  } catch {
    return null;
  }
}

async function clearUser() {
  await Preferences.remove({ key: USER_KEY });
}

// ── Biometric auth helper ─────────────────────────────────────────────────────

type BiometricResult = 'passed' | 'cancelled' | 'unavailable';

/**
 * Shows the biometric prompt and returns:
 *  - 'passed'      → user authenticated successfully
 *  - 'cancelled'   → user pressed Cancel or "Use password instead" → redirect to login
 *  - 'unavailable' → device has no biometrics or not enrolled → skip silently
 */
// Error codes from @capgo/capacitor-native-biometric BiometricAuthError enum
const BIOMETRIC_USER_CANCEL_CODES = new Set([16, 17, 11]); // USER_CANCEL, USER_FALLBACK, APP_CANCEL

async function promptBiometric(reason: string): Promise<BiometricResult> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const { isAvailable } = await NativeBiometric.isAvailable();

    if (!isAvailable) return 'unavailable';

    await NativeBiometric.verifyIdentity({ reason, title: reason });
    return 'passed';
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    return code !== undefined && BIOMETRIC_USER_CANCEL_CODES.has(code)
      ? 'cancelled'
      : 'unavailable';
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicUser | null>(null);
  const accessToken = ref<string | null>(null); // in-memory only — never persisted
  const isGuest = ref(false);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const biometricEnabled = ref(false);
  const biometricAsked = ref(false); // was the Face ID prompt ever shown on this device?

  // ── Computed ───────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const hasAccount = computed(() => isAuthenticated.value);
  const isPendingDeletion = computed(() => user.value?.deletionStatus === 'pending_deletion');
  const deletionScheduledAt = computed(() =>
    user.value?.deletionScheduledAt ? new Date(user.value.deletionScheduledAt) : null,
  );

  // ── Internal helpers ───────────────────────────────────────────────────────

  function setSession(u: PublicUser, tokens: { accessToken: string; refreshToken: string }) {
    user.value = u;
    accessToken.value = tokens.accessToken;
    isGuest.value = false;
    void saveUser(u);
  }

  function clearSession() {
    user.value = null;
    accessToken.value = null;
    void clearUser();
  }

  /** Wipes every persisted auth key — used on logout and hard reset. */
  async function clearAllStorage() {
    await Promise.all([
      clearRefreshToken(),
      clearUser(),
      Preferences.remove({ key: GUEST_KEY }),
      Preferences.remove({ key: BIOMETRIC_ENABLED_KEY }),
      Preferences.remove({ key: AUTH_PROVIDER_KEY }),
    ]);
  }

  // ── Initialization (called on app boot) ───────────────────────────────────

  type InitResult =
    | 'restored' // active session re-established
    | 'biometric-cancelled' // user chose to use password instead
    | 'no-session' // fresh install or fully logged out
    | 'guest' // continuing as guest
    | 'refresh-failed'; // stored token is invalid/expired

  async function initialize(): Promise<InitResult> {
    if (isInitialized.value) return 'restored';

    // 0. Load device-level flags that persist across logout (read unconditionally)
    const { value: askedFlag } = await Preferences.get({ key: BIOMETRIC_ASKED_KEY });
    biometricAsked.value = askedFlag === 'true';

    // 1. Guest flag — no session needed
    const { value: guestFlag } = await Preferences.get({ key: GUEST_KEY });
    if (guestFlag === 'true') {
      isGuest.value = true;
      isInitialized.value = true;
      return 'guest';
    }

    // 2. Check for a stored refresh token FIRST — if none, skip everything
    const storedRefreshToken = await loadRefreshToken();
    if (!storedRefreshToken) {
      // No session at all: also clear any leftover flags to stay consistent
      biometricEnabled.value = false;
      isInitialized.value = true;
      return 'no-session';
    }

    // 3. Load persisted biometric preference (only relevant when a session exists)
    const { value: bioFlag } = await Preferences.get({ key: BIOMETRIC_ENABLED_KEY });
    biometricEnabled.value = bioFlag === 'true';

    // 4. If biometric is enabled, require Face ID before restoring the session —
    //    but skip it if the app was just resumed from background (grace period).
    if (biometricEnabled.value) {
      const { value: bgAt } = await Preferences.get({ key: BACKGROUNDED_AT_KEY });
      const withinGrace = bgAt && Date.now() - parseInt(bgAt, 10) < BIOMETRIC_GRACE_MS;

      if (!withinGrace) {
        const biometricResult = await promptBiometric(`Sign in to ${appConfig.name}`);

        if (biometricResult === 'cancelled') {
          // User explicitly chose to use password — send to login
          isInitialized.value = true;
          return 'biometric-cancelled';
        }

        // 'unavailable' = device lost biometrics — fall through to silent refresh
      }
    }

    // 5. Load cached user immediately so the UI renders with data right away
    user.value = await loadUser();

    // 6. Restore session via refresh token
    try {
      const tokens = await AuthService.refresh(storedRefreshToken);
      await saveRefreshToken(tokens.refreshToken);
      accessToken.value = tokens.accessToken;
    } catch (err) {
      console.warn('[auth] refresh failed, clearing session:', err);
      await clearAllStorage();
      clearSession();
      biometricEnabled.value = false;
      isInitialized.value = true;
      return 'refresh-failed';
    }

    // 7. Refresh user data from server in the background (don't block render)
    AuthService.getMe()
      .then((fresh) => {
        user.value = fresh;
        void saveUser(fresh);
      })
      .catch((err) => console.warn('[auth] getMe failed:', err));

    isInitialized.value = true;

    // Register push token with the API now that we have a valid session
    flushPushToken();

    return 'restored';
  }

  // ── Auth actions ───────────────────────────────────────────────────────────

  async function register(dto: RegisterDto) {
    isLoading.value = true;
    try {
      const result = await AuthService.register(dto);
      await saveRefreshToken(result.tokens.refreshToken);
      setSession(result.user, result.tokens);
      await Preferences.remove({ key: GUEST_KEY });
      flushPushToken();
    } finally {
      isLoading.value = false;
    }
  }

  async function loginEmail(dto: LoginDto) {
    isLoading.value = true;
    try {
      const result = await AuthService.loginEmail(dto);
      await saveRefreshToken(result.tokens.refreshToken);
      setSession(result.user, result.tokens);
      await Preferences.remove({ key: GUEST_KEY });
      flushPushToken();
    } finally {
      isLoading.value = false;
    }
  }

  async function loginGoogle(dto: OAuthDto) {
    isLoading.value = true;
    try {
      const result = await AuthService.loginGoogle(dto);
      await saveRefreshToken(result.tokens.refreshToken);
      setSession(result.user, result.tokens);
      await Promise.all([
        Preferences.remove({ key: GUEST_KEY }),
        Preferences.set({ key: AUTH_PROVIDER_KEY, value: 'google' }),
      ]);
      flushPushToken();
    } finally {
      isLoading.value = false;
    }
  }

  async function loginApple(dto: OAuthDto) {
    isLoading.value = true;
    try {
      const result = await AuthService.loginApple(dto);
      await saveRefreshToken(result.tokens.refreshToken);
      setSession(result.user, result.tokens);
      await Promise.all([
        Preferences.remove({ key: GUEST_KEY }),
        Preferences.set({ key: AUTH_PROVIDER_KEY, value: 'apple' }),
      ]);
      flushPushToken();
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshTokens(): Promise<boolean> {
    const storedRefreshToken = await loadRefreshToken();
    if (!storedRefreshToken) return false;

    try {
      const tokens = await AuthService.refresh(storedRefreshToken);
      await saveRefreshToken(tokens.refreshToken);
      accessToken.value = tokens.accessToken;
      return true;
    } catch {
      await clearAllStorage();
      clearSession();
      biometricEnabled.value = false;
      return false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      const [storedRefreshToken, { value: provider }] = await Promise.all([
        loadRefreshToken(),
        Preferences.get({ key: AUTH_PROVIDER_KEY }),
      ]);
      await Promise.all([
        storedRefreshToken
          ? AuthService.logout(storedRefreshToken).catch(() => undefined)
          : Promise.resolve(),
        provider === 'google' || provider === 'apple'
          ? import('@capgo/capacitor-social-login').then(({ SocialLogin }) =>
              SocialLogin.logout({ provider }).catch(() => undefined),
            )
          : Promise.resolve(),
      ]);
    } finally {
      await clearAllStorage();
      clearSession();
      biometricEnabled.value = false;
      isGuest.value = false;
      isLoading.value = false;
      void notificationsService.unregisterToken();
    }
  }

  async function continueAsGuest() {
    // Clear any leftover session data before going guest
    await clearAllStorage();
    clearSession();
    biometricEnabled.value = false;
    await Preferences.set({ key: GUEST_KEY, value: 'true' });
    isGuest.value = true;
  }

  async function verifyEmail(email: string, code: string): Promise<void> {
    isLoading.value = true;
    try {
      const updatedUser = await AuthService.verifyEmail({ email, code });
      user.value = updatedUser;
      void saveUser(updatedUser);
    } finally {
      isLoading.value = false;
    }
  }

  async function enableBiometric() {
    await Preferences.set({ key: BIOMETRIC_ENABLED_KEY, value: 'true' });
    biometricEnabled.value = true;
  }

  async function disableBiometric() {
    await Preferences.remove({ key: BIOMETRIC_ENABLED_KEY });
    biometricEnabled.value = false;
  }

  /** Marks that the Face ID setup prompt has been shown. Never cleared on logout. */
  async function markBiometricAsked() {
    await Preferences.set({ key: BIOMETRIC_ASKED_KEY, value: 'true' });
    biometricAsked.value = true;
  }

  async function requestDeletion(password?: string): Promise<{ scheduledAt: Date }> {
    const { scheduledAt } = await AccountService.requestDeletion(password);
    const date = new Date(scheduledAt);
    if (user.value) {
      user.value = {
        ...user.value,
        deletionStatus: 'pending_deletion',
        deletionScheduledAt: scheduledAt,
      };
      void saveUser(user.value);
    }
    return { scheduledAt: date };
  }

  async function cancelDeletion(): Promise<void> {
    await AccountService.cancelDeletion();
    if (user.value) {
      const { deletionScheduledAt: _drop, ...rest } = user.value;
      user.value = { ...rest, deletionStatus: 'active' };
      void saveUser(user.value);
    }
  }

  /**
   * Set the username for the first time (onboarding picker).
   * Updates the in-memory user and persists to cache.
   */
  async function setUsername(rawUsername: string): Promise<void> {
    const normalized = await UsernameService.setUsername(rawUsername);
    if (user.value) {
      user.value = { ...user.value, username: normalized };
      void saveUser(user.value);
    }
  }

  /**
   * Change an existing username (subject to 30-day cooldown).
   * Updates the in-memory user and persists to cache.
   */
  async function changeUsername(rawUsername: string): Promise<void> {
    const normalized = await UsernameService.changeUsername(rawUsername);
    if (user.value) {
      user.value = {
        ...user.value,
        username: normalized,
        usernameChangedAt: new Date().toISOString(),
      };
      void saveUser(user.value);
    }
  }

  /**
   * Update the authenticated user's display name.
   * Updates the in-memory user and persists to cache.
   */
  async function updateName(name: string): Promise<void> {
    const updated = await UserService.updateName(name);
    user.value = updated;
    void saveUser(updated);
  }

  /**
   * Upload or replace the authenticated user's avatar.
   * Updates the in-memory user and persists to cache.
   */
  async function updatePhoto(file: File): Promise<void> {
    const updated = await UserService.updatePhoto(file);
    user.value = updated;
    void saveUser(updated);
  }

  /**
   * Remove the authenticated user's avatar (revert to default).
   */
  async function removePhoto(): Promise<void> {
    const updated = await UserService.removePhoto();
    user.value = updated;
    void saveUser(updated);
  }

  /**
   * Change password for local-auth accounts.
   * All sessions are invalidated server-side — caller must handle re-login UX.
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await UserService.updatePassword(currentPassword, newPassword);
  }

  return {
    // State
    user,
    accessToken,
    isGuest,
    isInitialized,
    isLoading,
    biometricEnabled,
    biometricAsked,
    // Computed
    isAuthenticated,
    hasAccount,
    isPendingDeletion,
    deletionScheduledAt,
    // Actions
    initialize,
    register,
    loginEmail,
    loginGoogle,
    loginApple,
    refreshTokens,
    logout,
    continueAsGuest,
    verifyEmail,
    enableBiometric,
    disableBiometric,
    markBiometricAsked,
    requestDeletion,
    cancelDeletion,
    setUsername,
    changeUsername,
    updateName,
    updatePhoto,
    removePhoto,
    changePassword,
  };
});
