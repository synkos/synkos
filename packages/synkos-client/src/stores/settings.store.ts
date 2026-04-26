import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationsService } from '../services/notifications.service.js';
import { getClientConfig } from '../internal/app-config.js';
import { setLocale } from '../internal/i18n-bridge.js';

type MessageLanguages = string;

interface PersistedSettings {
  appLang: MessageLanguages;
  haptics: boolean;
  pushNotificationsEnabled: boolean;
}

function getStorageKey() {
  return getClientConfig().storageKeys.settings;
}

function load(): PersistedSettings {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) return JSON.parse(raw) as PersistedSettings;
  } catch {
    // ignore
  }
  const defaultLang: MessageLanguages = navigator.language.startsWith('en') ? 'en-US' : 'es-ES';
  return { appLang: defaultLang, haptics: true, pushNotificationsEnabled: true };
}

function persist(settings: PersistedSettings) {
  localStorage.setItem(getStorageKey(), JSON.stringify(settings));
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
