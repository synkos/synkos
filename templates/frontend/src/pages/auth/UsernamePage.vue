<template>
  <div class="auth-root">
    <div class="auth-screen">
      <div class="auth-header">
        <div class="auth-app-icon">
          <!-- Replace with your app icon/logo -->
          <AppIcon name="style" size="38px" style="color: #fff" />
        </div>
        <h1 class="app-title">{{ appName }}</h1>
        <p class="app-tagline">{{ t('pages.usernamePicker.tagline') }}</p>
      </div>

      <div class="form-block">
        <p class="form-subtitle">{{ t('pages.usernamePicker.subtitle') }}</p>

        <div class="field-group">
          <div
            class="field-wrap username-field-wrap"
            :class="{
              'field-wrap--error': statusType === 'error',
              'field-wrap--success': statusType === 'success',
            }"
          >
            <span class="username-prefix">@</span>
            <input
              ref="inputRef"
              v-model="username"
              type="text"
              class="field-input username-input"
              :placeholder="t('pages.usernamePicker.placeholder')"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              maxlength="20"
              @input="onInput"
            />
            <div class="username-status-icon">
              <AppSpinner v-if="isChecking" size="16px" color="white" />
              <AppIcon
                v-else-if="statusType === 'success'"
                name="check_circle"
                size="18px"
                style="color: var(--color-positive)"
              />
              <AppIcon
                v-else-if="statusType === 'error'"
                name="cancel"
                size="18px"
                style="color: var(--color-negative)"
              />
            </div>
          </div>
        </div>

        <p v-if="!username" class="rules-hint">{{ t('pages.usernamePicker.rulesHint') }}</p>

        <div class="feedback-area">
          <Transition name="fade" mode="out-in">
            <div v-if="errorMessage" key="error" class="error-text">{{ errorMessage }}</div>
            <div v-else-if="statusType === 'success'" key="ok" class="success-text">
              <AppIcon name="check_circle_outline" size="16px" />
              {{ t('pages.usernamePicker.available') }}
            </div>
          </Transition>
        </div>

        <Transition name="fade">
          <div v-if="suggestions.length > 0" class="suggestions-block">
            <p class="suggestions-label">{{ t('pages.usernamePicker.suggestionsLabel') }}</p>
            <div class="suggestions-list">
              <button
                v-for="s in suggestions"
                :key="s"
                class="suggestion-chip"
                @click="applySuggestion(s)"
              >
                @{{ s }}
              </button>
            </div>
          </div>
        </Transition>

        <AppButton
          :loading="isSubmitting"
          :disabled="isSubmitting || statusType !== 'success'"
          @click="handleSubmit"
        >
          {{ t('pages.usernamePicker.confirm') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuthStore, UsernameService, getClientConfig } from '@synkos/client';
import { AppIcon, AppSpinner, AppButton } from '@synkos/ui';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const appConfig = getClientConfig();
const appName = appConfig.name;

const inputRef = ref<HTMLInputElement | null>(null);
const username = ref('');
const isChecking = ref(false);
const isSubmitting = ref(false);
const statusType = ref<'idle' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const suggestions = ref<string[]>([]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onInput() {
  statusType.value = 'idle';
  errorMessage.value = '';
  suggestions.value = [];
  const raw = username.value.trim();
  if (!raw) {
    isChecking.value = false;
    return;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  isChecking.value = true;
  debounceTimer = setTimeout(() => {
    void checkAvailability(raw);
  }, 400);
}

async function checkAvailability(raw: string) {
  try {
    const result = await UsernameService.check(raw);
    if (username.value.trim() !== raw) return;
    if (result.available) {
      statusType.value = 'success';
      errorMessage.value = '';
      suggestions.value = [];
    } else {
      statusType.value = 'error';
      errorMessage.value = result.errorMessage ?? t('pages.usernamePicker.errors.taken');
      suggestions.value = result.suggestions ?? [];
    }
  } catch {
    if (username.value.trim() !== raw) return;
    statusType.value = 'error';
    errorMessage.value = t('pages.usernamePicker.errors.checkFailed');
  } finally {
    if (username.value.trim() === raw) isChecking.value = false;
  }
}

function applySuggestion(s: string) {
  username.value = s;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  onInput();
}

async function handleSubmit() {
  if (statusType.value !== 'success' || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await authStore.setUsername(username.value.trim());
    void Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined);
    await router.replace({ name: 'home' });
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
      ?.error?.message;
    if (msg?.includes('already taken') || msg?.includes('409')) {
      statusType.value = 'error';
      errorMessage.value = t('pages.usernamePicker.errors.taken');
      void checkAvailability(username.value.trim());
    } else {
      statusType.value = 'error';
      errorMessage.value = msg ?? t('pages.usernamePicker.errors.generic');
    }
  } finally {
    isSubmitting.value = false;
  }
}

onMounted(() => {
  const displayName = authStore.user?.displayName ?? '';
  if (displayName) {
    const base = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15);
    if (base.length >= 3) {
      username.value = base;
      isChecking.value = true;
      void checkAvailability(base);
    }
  }
  setTimeout(() => inputRef.value?.focus(), 300);
});
</script>

<style lang="scss" scoped>
.auth-root {
  min-height: 100dvh;
  background: var(--auth-bg, #000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 24px env(safe-area-inset-bottom, 24px);
  overflow-y: auto;
}

.auth-screen {
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  padding-top: max(env(safe-area-inset-top, 0px), 48px);
  padding-bottom: 40px;
}

.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.auth-app-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: var(--auth-icon-bg, linear-gradient(135deg, #1a1a2e, #16213e));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--auth-text-primary, rgba(255, 255, 255, 0.95));
  margin: 0;
  letter-spacing: -0.3px;
}

.app-tagline {
  font-size: 14px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.5));
  margin: 0;
  text-align: center;
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-subtitle {
  font-size: 15px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.65));
  margin: 0;
  line-height: 1.5;
  text-align: center;
}

.field-group {
  background: var(--auth-surface-1, rgba(255, 255, 255, 0.06));
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--auth-border, rgba(255, 255, 255, 0.08));
}

.field-wrap {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 52px;
  transition: background 0.15s;

  &--error {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
  }
  &--success {
    background: rgba(34, 197, 94, 0.06);
    border-color: rgba(34, 197, 94, 0.25);
  }
}

.username-field-wrap {
  gap: 8px;
}

.username-prefix {
  font-size: 17px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.45));
  font-weight: 500;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 17px;
  color: var(--auth-text-primary, #ffffff);
  font-family: inherit;
  letter-spacing: 0.3px;
  caret-color: var(--color-primary, #0a84ff);

  &::placeholder {
    color: var(--auth-text-subtle, rgba(255, 255, 255, 0.25));
  }
}

.username-input {
  letter-spacing: 0.4px;
}

.username-status-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 22px;
  justify-content: center;
}

.rules-hint {
  font-size: 12px;
  color: var(--auth-text-subtle, rgba(255, 255, 255, 0.35));
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

.feedback-area {
  min-height: 22px;
  display: flex;
  align-items: center;
}

.error-text {
  font-size: 13px;
  color: var(--color-negative);
  line-height: 1.4;
}

.success-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-positive);
}

.suggestions-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestions-label {
  font-size: 12px;
  color: var(--auth-text-muted, rgba(255, 255, 255, 0.4));
  margin: 0;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 13px;
  color: #a5b4fc;
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover,
  &:active {
    background: rgba(99, 102, 241, 0.28);
    border-color: rgba(99, 102, 241, 0.55);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
