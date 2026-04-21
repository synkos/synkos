import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { useAuthStore } from 'src/stores/auth.store';

/**
 * Manages the sign-out flow: dialog visibility, confirm/farewell state
 * machine, and the actual logout + navigation.
 */
export function useSignOut() {
  const router = useRouter();
  const authStore = useAuthStore();

  const showDialog = ref(false);
  const state = ref<'confirm' | 'farewell'>('confirm');
  const isProcessing = ref(false);
  const wasGuest = ref(false);

  function open() {
    void Haptics.impact({ style: ImpactStyle.Light });
    wasGuest.value = authStore.isGuest;
    state.value = 'confirm';
    showDialog.value = true;
  }

  async function confirm() {
    void Haptics.impact({ style: ImpactStyle.Medium });
    isProcessing.value = true;
    try {
      await authStore.logout();
      await Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
      state.value = 'farewell';
      await new Promise<void>((resolve) => setTimeout(resolve, 1800));
      showDialog.value = false;
      void router.replace({ name: 'auth-login' });
    } catch {
      isProcessing.value = false;
    }
  }

  return { showDialog, state, isProcessing, wasGuest, open, confirm };
}
