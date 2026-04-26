<template>
  <div class="auth-root">
    <div class="auth-screen">
      <!-- Logo block -->
      <div class="auth-header">
        <div class="app-icon">
          <q-icon name="style" size="38px" color="white" />
        </div>
        <h1 class="app-title">{{ appName }}</h1>
        <p class="app-tagline">{{ t('pages.usernamePicker.tagline') }}</p>
      </div>

      <!-- Form block -->
      <div class="form-block">
        <p class="form-subtitle">{{ t('pages.usernamePicker.subtitle') }}</p>

        <!-- Username input -->
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
              <q-spinner v-if="isChecking" size="16px" color="white" />
              <q-icon
                v-else-if="statusType === 'success'"
                name="check_circle"
                size="18px"
                color="positive"
              />
              <q-icon
                v-else-if="statusType === 'error'"
                name="cancel"
                size="18px"
                color="negative"
              />
            </div>
          </div>
        </div>

        <!-- Rules hint (shown before user types) -->
        <p v-if="!username" class="rules-hint">
          {{ t('pages.usernamePicker.rulesHint') }}
        </p>

        <!-- Feedback: error or success -->
        <div class="feedback-area">
          <Transition name="fade" mode="out-in">
            <div v-if="errorMessage" key="error" class="error-text">
              {{ errorMessage }}
            </div>
            <div v-else-if="statusType === 'success'" key="ok" class="success-text">
              <q-icon name="check_circle_outline" size="16px" />
              {{ t('pages.usernamePicker.available') }}
            </div>
          </Transition>
        </div>

        <!-- Suggestions (shown when taken) -->
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

        <!-- Confirm button -->
        <button
          class="primary-btn"
          :disabled="isSubmitting || statusType !== 'success'"
          @click="handleSubmit"
        >
          <q-spinner v-if="isSubmitting" size="18px" color="white" />
          <span v-else>{{ t('pages.usernamePicker.confirm') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuthStore } from '../../../stores/auth.store.js';
import { UsernameService } from '../../../services/username.service.js';
import { getClientConfig } from '../../../internal/app-config.js';
const appConfig = getClientConfig();

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const appName = appConfig.name;

// ── State ─────────────────────────────────────────────────────────────────────

const inputRef = ref<HTMLInputElement | null>(null);
const username = ref('');
const isChecking = ref(false);
const isSubmitting = ref(false);
const statusType = ref<'idle' | 'success' | 'error'>('idle');
const errorMessage = ref('');
const suggestions = ref<string[]>([]);

// ── Debounce ──────────────────────────────────────────────────────────────────

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onInput() {
  // Reset state immediately on any keystroke
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

    // Ignore stale responses if the input changed while the request was in flight
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
    if (username.value.trim() === raw) {
      isChecking.value = false;
    }
  }
}

// ── Suggestions ───────────────────────────────────────────────────────────────

function applySuggestion(s: string) {
  username.value = s;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  onInput();
}

// ── Submit ────────────────────────────────────────────────────────────────────

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
      // Someone snatched the username in the tiny window between check and submit
      statusType.value = 'error';
      errorMessage.value = t('pages.usernamePicker.errors.taken');
      // Re-check to fetch fresh suggestions
      void checkAvailability(username.value.trim());
    } else {
      statusType.value = 'error';
      errorMessage.value = msg ?? t('pages.usernamePicker.errors.generic');
    }
  } finally {
    isSubmitting.value = false;
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  // Pre-fill with a suggestion derived from the user's display name
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

  // Focus the input after mount
  setTimeout(() => inputRef.value?.focus(), 300);
});
</script>

<style scoped>
/* ── Reuse the same layout primitives as LoginPage ── */

.auth-root {
  min-height: 100dvh;
  background: #0a0a0a;
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

/* ── Header ── */
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
}

.app-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35);
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
}

.app-tagline {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-align: center;
}

/* ── Form block ── */
.form-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-subtitle {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
  text-align: center;
}

/* ── Field ── */
.field-group {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.field-wrap {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 52px;
  transition: background 0.15s;
}

.field-wrap--error {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
}

.field-wrap--success {
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}

.username-field-wrap {
  gap: 8px;
}

.username-prefix {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 17px;
  color: #ffffff;
  font-family: inherit;
  letter-spacing: 0.3px;
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
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

/* ── Hints ── */
.rules-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

/* ── Feedback ── */
.feedback-area {
  min-height: 22px;
  display: flex;
  align-items: center;
}

.error-text {
  font-size: 13px;
  color: #ef4444;
  line-height: 1.4;
}

.success-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #22c55e;
}

/* ── Suggestions ── */
.suggestions-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestions-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
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
}

.suggestion-chip:hover,
.suggestion-chip:active {
  background: rgba(99, 102, 241, 0.28);
  border-color: rgba(99, 102, 241, 0.55);
}

/* ── Primary button ── */
.primary-btn {
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
  margin-top: 4px;
}

.primary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
