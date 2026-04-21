import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setLocale, type MessageLanguages } from 'src/boot/i18n';
import { notificationsService } from 'src/services/notifications.service';
import { appConfig } from 'src/app.config';

interface PersistedSettings {
  appLang: MessageLanguages;
  haptics: boolean;
  pushNotificationsEnabled: boolean;
}

const STORAGE_KEY = appConfig.storageKeys.settings;

function load(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedSettings;
  } catch {
    // ignore
  }
  const defaultLang: MessageLanguages = navigator.language.startsWith('en') ? 'en-US' : 'es-ES';
  return {
    appLang: defaultLang,
    haptics: true,
    pushNotificationsEnabled: true,
  };
}

function persist(settings: PersistedSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = load();

  const appLang = ref<MessageLanguages>(saved.appLang);
  const haptics = ref<boolean>(saved.haptics);
  const pushNotificationsEnabled = ref<boolean>(saved.pushNotificationsEnabled);

  function save() {
    persist({
      appLang: appLang.value,
      haptics: haptics.value,
      pushNotificationsEnabled: pushNotificationsEnabled.value,
    });
  }

  function setAppLang(lang: MessageLanguages) {
    appLang.value = lang;
    setLocale(lang);
    save();
  }

  function setHaptics(value: boolean) {
    haptics.value = value;
    save();
  }

  /**
   * Enable or disable push notifications.
   * - Enabling: requests OS permission if needed and re-registers the token with the backend.
   * - Disabling: removes the token from the backend so no notifications are delivered.
   */
  async function setPushNotificationsEnabled(value: boolean): Promise<void> {
    if (value) {
      const success = await notificationsService.enable();
      if (!success) return;
    } else {
      void notificationsService.unregisterToken();
    }

    pushNotificationsEnabled.value = value;
    save();
  }

  return {
    appLang,
    haptics,
    pushNotificationsEnabled,
    setAppLang,
    setHaptics,
    setPushNotificationsEnabled,
  };
});
