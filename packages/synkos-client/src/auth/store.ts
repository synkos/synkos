import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from './services/auth.service.js';
import { AccountService } from './services/account.service.js';
import { UsernameService } from './services/username.service.js';
import { UserService } from './services/user.service.js';
import { notificationsService } from '../services/notifications.service.js';
import { getClientConfig } from '../internal/app-config.js';
import { registerTokenProvider } from '../api/token-provider.js';
import type { PublicUser, RegisterDto, LoginDto, OAuthDto } from '../types.js';

// ── Storage key helpers ───────────────────────────────────────────────────────

function getAuthKeys() {
  const { storageKeys } = getClientConfig();
  const prefix = storageKeys.settings.replace(/-settings$/, '');
  return {
    guest: `${prefix}-guest`,
    biometricEnabled: `${prefix}-biometric-enabled`,
    biometricAsked: `${prefix}-biometric-asked`,
    user: `${prefix}-user`,
    backgroundedAt: `${prefix}-backgrounded-at`,
    authProvider: `${prefix}-auth-provider`,
  };
}

// ── iOS Keychain (via NativeBiometric) ────────────────────────────────────────

function getKeychainServer() {
  return getClientConfig().bundleId;
}

const KEYCHAIN_USER = 'refresh-token';

async function saveRefreshToken(token: string) {
  const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
  await NativeBiometric.setCredentials({
    server: getKeychainServer(),
    username: KEYCHAIN_USER,
    password: token,
  });
}

async function loadRefreshToken(): Promise<string | null> {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    const { password } = await NativeBiometric.getCredentials({ server: getKeychainServer() });
    return password ?? null;
  } catch {
    return null;
  }
}

async function clearRefreshToken() {
  try {
    const { NativeBiometric } = await import('@capgo/capacitor-native-biometric');
    await NativeBiometric.deleteCredentials({ server: getKeychainServer() });
  } catch {
    // No credentials stored — nothing to delete
  }
}

// ── User cache ────────────────────────────────────────────────────────────────

async function saveUser(u: PublicUser) {
  const { user: key } = getAuthKeys();
  await Preferences.set({ key, value: JSON.stringify(u) });
}

async function loadUser(): Promise<PublicUser | null> {
  const { user: key } = getAuthKeys();
  const { value } = await Preferences.get({ key });
  if (!value) return null;
  try {
    return JSON.parse(value) as PublicUser;
  } catch {
    return null;
  }
}

async function clearUser() {
  const { user: key } = getAuthKeys();
  await Preferences.remove({ key });
}

// ── Biometric ─────────────────────────────────────────────────────────────────

const BIOMETRIC_GRACE_MS = 15 * 60 * 1000;

type BiometricResult = 'passed' | 'cancelled' | 'unavailable';

const BIOMETRIC_USER_CANCEL_CODES = new Set([16, 17, 11]);

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
  const accessToken = ref<string | null>(null);
  const isGuest = ref(false);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const biometricEnabled = ref(false);
  const biometricAsked = ref(false);

  // Register the token provider for the API client (replaces window.__pinia hack)
  registerTokenProvider(() => accessToken.value);

  // ── Computed ───────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const hasAccount = computed(() => isAuthenticated.value);
  const isPendingDeletion = computed(() => user.value?.deletionStatus === 'pending_deletion');
  const deletionScheduledAt = computed(() =>
    user.value?.deletionScheduledAt ? new Date(user.value.deletionScheduledAt) : null
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

  async function clearAllStorage() {
    const keys = getAuthKeys();
    await Promise.all([
      clearRefreshToken(),
      clearUser(),
      Preferences.remove({ key: keys.guest }),
      Preferences.remove({ key: keys.biometricEnabled }),
      Preferences.remove({ key: keys.authProvider }),
    ]);
  }

  // ── Initialization ─────────────────────────────────────────────────────────

  type InitResult = 'restored' | 'biometric-cancelled' | 'no-session' | 'guest' | 'refresh-failed';

  async function initialize(): Promise<InitResult> {
    if (isInitialized.value) return 'restored';

    const keys = getAuthKeys();
    const config = getClientConfig();

    const { value: askedFlag } = await Preferences.get({ key: keys.biometricAsked });
    biometricAsked.value = askedFlag === 'true';

    const { value: guestFlag } = await Preferences.get({ key: keys.guest });
    if (guestFlag === 'true') {
      isGuest.value = true;
      isInitialized.value = true;
      return 'guest';
    }

    const storedRefreshToken = await loadRefreshToken();
    if (!storedRefreshToken) {
      biometricEnabled.value = false;
      isInitialized.value = true;
      return 'no-session';
    }

    const { value: bioFlag } = await Preferences.get({ key: keys.biometricEnabled });
    biometricEnabled.value = bioFlag === 'true' && config.features.faceId !== false;

    if (biometricEnabled.value) {
      const { value: bgAt } = await Preferences.get({ key: keys.backgroundedAt });
      const withinGrace = bgAt && Date.now() - parseInt(bgAt, 10) < BIOMETRIC_GRACE_MS;

      if (!withinGrace) {
        const biometricResult = await promptBiometric(`Sign in to ${config.name}`);

        if (biometricResult === 'cancelled') {
          isInitialized.value = true;
          return 'biometric-cancelled';
        }
      }
    }

    user.value = await loadUser();

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

    AuthService.getMe()
      .then((fresh) => {
        user.value = fresh;
        void saveUser(fresh);
      })
      .catch((err) => console.warn('[auth] getMe failed:', err));

    isInitialized.value = true;
    void flushPushTokenIfEnabled();
    return 'restored';
  }

  // ── Auth actions ───────────────────────────────────────────────────────────

  async function register(dto: RegisterDto) {
    isLoading.value = true;
    try {
      const result = await AuthService.register(dto);
      await saveRefreshToken(result.tokens.refreshToken);
      setSession(result.user, result.tokens);
      const keys = getAuthKeys();
      await Preferences.remove({ key: keys.guest });
      void flushPushTokenIfEnabled();
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
      const keys = getAuthKeys();
      await Preferences.remove({ key: keys.guest });
      void flushPushTokenIfEnabled();
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
      const keys = getAuthKeys();
      await Promise.all([
        Preferences.remove({ key: keys.guest }),
        Preferences.set({ key: keys.authProvider, value: 'google' }),
      ]);
      void flushPushTokenIfEnabled();
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
      const keys = getAuthKeys();
      await Promise.all([
        Preferences.remove({ key: keys.guest }),
        Preferences.set({ key: keys.authProvider, value: 'apple' }),
      ]);
      void flushPushTokenIfEnabled();
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
      const keys = getAuthKeys();
      const [storedRefreshToken, { value: provider }] = await Promise.all([
        loadRefreshToken(),
        Preferences.get({ key: keys.authProvider }),
      ]);
      await Promise.all([
        storedRefreshToken
          ? AuthService.logout(storedRefreshToken).catch(() => undefined)
          : Promise.resolve(),
        provider === 'google' || provider === 'apple'
          ? import('@capgo/capacitor-social-login').then(({ SocialLogin }) =>
              SocialLogin.logout({ provider: provider as 'google' | 'apple' }).catch(
                () => undefined
              )
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
    await clearAllStorage();
    clearSession();
    biometricEnabled.value = false;
    const keys = getAuthKeys();
    await Preferences.set({ key: keys.guest, value: 'true' });
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
    const keys = getAuthKeys();
    await Preferences.set({ key: keys.biometricEnabled, value: 'true' });
    biometricEnabled.value = true;
  }

  async function disableBiometric() {
    const keys = getAuthKeys();
    await Preferences.remove({ key: keys.biometricEnabled });
    biometricEnabled.value = false;
  }

  async function markBiometricAsked() {
    const keys = getAuthKeys();
    await Preferences.set({ key: keys.biometricAsked, value: 'true' });
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deletionScheduledAt: _drop, ...rest } = user.value;
      user.value = { ...rest, deletionStatus: 'active' };
      void saveUser(user.value);
    }
  }

  async function setUsername(rawUsername: string): Promise<void> {
    const normalized = await UsernameService.setUsername(rawUsername);
    if (user.value) {
      user.value = { ...user.value, username: normalized };
      void saveUser(user.value);
    }
  }

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

  async function updateName(name: string): Promise<void> {
    const updated = await UserService.updateName(name);
    user.value = updated;
    void saveUser(updated);
  }

  async function updatePhoto(file: File): Promise<void> {
    const updated = await UserService.updatePhoto(file);
    user.value = updated;
    void saveUser(updated);
  }

  async function removePhoto(): Promise<void> {
    const updated = await UserService.removePhoto();
    user.value = updated;
    void saveUser(updated);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await UserService.updatePassword(currentPassword, newPassword);
  }

  return {
    user,
    accessToken,
    isGuest,
    isInitialized,
    isLoading,
    biometricEnabled,
    biometricAsked,
    isAuthenticated,
    hasAccount,
    isPendingDeletion,
    deletionScheduledAt,
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

// ── Internal helper (avoids circular dep with settings.store) ─────────────────

function flushPushTokenIfEnabled() {
  import('../stores/settings.store.js')
    .then(({ useSettingsStore }) => {
      if (useSettingsStore().pushNotificationsEnabled) {
        void notificationsService.flushPendingToken();
      }
    })
    .catch(() => undefined);
}
