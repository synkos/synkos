import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettingsStore } from 'src/stores/settings.store';
import { useAuthStore } from 'src/stores/auth.store';
import { notificationsService } from 'src/services/notifications.service';
import type { MessageLanguages } from 'src/i18n';

export function useSettings() {
  const { t } = useI18n();
  const router = useRouter();
  const settingsStore = useSettingsStore();
  const authStore = useAuthStore();

  // ── Push notifications ──────────────────────────────────────────
  const osDenied = ref(false);
  const togglingPush = ref(false);

  onMounted(async () => {
    const status = await notificationsService.checkPermissionStatus();
    osDenied.value = status === 'denied';
  });

  async function onTogglePush(value: boolean): Promise<void> {
    togglingPush.value = true;
    try {
      await settingsStore.setPushNotificationsEnabled(value);
      const status = await notificationsService.checkPermissionStatus();
      osDenied.value = status === 'denied';
    } finally {
      togglingPush.value = false;
    }
  }

  // ── Navigation ──────────────────────────────────────────────────
  function goToDeleteAccount(): void {
    void router.push({ name: 'settings-account-delete' });
  }

  // ── Language options ─────────────────────────────────────────────
  const appLangs = computed<{ value: MessageLanguages; label: string }[]>(() => [
    { value: 'en-US', label: t('pages.settings.languages.en-US') },
    { value: 'es-ES', label: t('pages.settings.languages.es-ES') },
  ]);

  return {
    settingsStore,
    authStore,
    osDenied,
    togglingPush,
    onTogglePush,
    goToDeleteAccount,
    appLangs,
  };
}
