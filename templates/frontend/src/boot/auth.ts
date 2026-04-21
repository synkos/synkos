import { defineBoot } from '#q-app/wrappers';
import { Preferences } from '@capacitor/preferences';
import { useAuthStore } from 'src/stores/auth.store';

const BACKGROUNDED_AT_KEY = 'tgc-backgrounded-at';

export default defineBoot(async ({ router }) => {
  const authStore = useAuthStore();

  // Track when the app goes to background so initialize() can skip Face ID
  // on quick resumes (within the grace period).
  const { App } = await import('@capacitor/app');
  void App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
      void Preferences.set({ key: BACKGROUNDED_AT_KEY, value: String(Date.now()) });
    }
  });

  let result: Awaited<ReturnType<typeof authStore.initialize>> = 'no-session';

  try {
    result = await authStore.initialize();
  } catch (err: unknown) {
    console.warn('[auth boot] initialize failed:', err);
    authStore.$patch({ isInitialized: true });
  }

  // User pressed "Use password instead" or cancelled Face ID → send to login
  if (result === 'biometric-cancelled' || result === 'refresh-failed') {
    await router.replace({ name: 'auth-login' });
  }
});
