<template>
  <AppPage class="change-username-page">
    <div class="page-scroll">
      <div class="form-card">
        <p class="card-subtitle">{{ t('pages.changeUsername.subtitle') }}</p>

        <!-- Cooldown banner -->
        <div v-if="cooldownDaysLeft !== null" class="cooldown-banner">
          <AppIcon name="schedule" size="18px" class="cooldown-icon" />
          <span>{{ t('pages.changeUsername.cooldown', { days: cooldownDaysLeft }) }}</span>
        </div>

        <!-- Input -->
        <div
          class="field-wrap"
          :class="{
            'field-wrap--error': statusType === 'error',
            'field-wrap--success': statusType === 'success',
          }"
        >
          <span class="username-prefix">@</span>
          <input
            v-model="username"
            type="text"
            class="field-input"
            :placeholder="t('pages.changeUsername.placeholder')"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            maxlength="20"
            :disabled="cooldownDaysLeft !== null || isSaving"
            @input="onInput"
          />
          <div class="status-icon">
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

        <!-- Feedback -->
        <Transition name="fade" mode="out-in">
          <p v-if="errorMessage" key="err" class="feedback feedback--error">{{ errorMessage }}</p>
          <p v-else-if="statusType === 'success'" key="ok" class="feedback feedback--success">
            {{ t('pages.changeUsername.available') }}
          </p>
        </Transition>

        <!-- Suggestions -->
        <div v-if="suggestions.length" class="suggestions">
          <p class="suggestions-label">{{ t('pages.changeUsername.suggestions') }}</p>
          <div class="suggestions-chips">
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

        <!-- Save button -->
        <button class="save-btn" :disabled="!canSave" @click="saveUsername">
          <AppSpinner v-if="isSaving" size="18px" color="white" />
          <span v-else>{{ t('pages.changeUsername.save') }}</span>
        </button>

        <p class="policy-note">{{ t('pages.changeUsername.policy') }}</p>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { AppPage, AppIcon, AppSpinner } from '@synkos/ui';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../../../auth/store.js';
import { UsernameService } from '../../../../../auth/services/username.service.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// ── Cooldown ──────────────────────────────────────────────────────────────────

const cooldownDaysLeft = computed<number | null>(() => {
  const changedAt = authStore.user?.usernameChangedAt;
  if (!changedAt) return null;

  const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
  const nextAllowed = new Date(new Date(changedAt).getTime() + COOLDOWN_MS);
  const diff = nextAllowed.getTime() - Date.now();
  if (diff <= 0) return null;

  return Math.ceil(diff / (24 * 60 * 60 * 1000));
});

// ── Availability check ────────────────────────────────────────────────────────

type StatusType = 'idle' | 'checking' | 'success' | 'error';

const username = ref('');
const statusType = ref<StatusType>('idle');
const isChecking = ref(false);
const errorMessage = ref('');
const suggestions = ref<string[]>([]);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastChecked = '';

onMounted(() => {
  username.value = authStore.user?.username ?? '';
});

function onInput() {
  statusType.value = 'idle';
  errorMessage.value = '';
  suggestions.value = [];

  const raw = username.value.trim();
  if (!raw || raw === authStore.user?.username) return;

  isChecking.value = true;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void checkAvailability(raw);
  }, 400);
}

async function checkAvailability(raw: string) {
  lastChecked = raw;
  try {
    const result = await UsernameService.check(raw);
    if (username.value.trim() !== raw) return; // stale response

    if (result.available) {
      statusType.value = 'success';
      suggestions.value = [];
      errorMessage.value = '';
    } else {
      statusType.value = 'error';
      errorMessage.value = result.errorMessage ?? t('pages.changeUsername.taken');
      suggestions.value = result.suggestions ?? [];
    }
  } catch {
    if (username.value.trim() !== raw) return;
    statusType.value = 'error';
    errorMessage.value = t('pages.changeUsername.checkFailed');
  } finally {
    if (username.value.trim() === lastChecked) {
      isChecking.value = false;
    }
  }
}

function applySuggestion(s: string) {
  username.value = s;
  onInput();
}

// ── Save ──────────────────────────────────────────────────────────────────────

const isSaving = ref(false);

const canSave = computed(
  () =>
    statusType.value === 'success' &&
    !isChecking.value &&
    !isSaving.value &&
    cooldownDaysLeft.value === null &&
    username.value.trim() !== authStore.user?.username
);

async function saveUsername() {
  if (!canSave.value) return;

  isSaving.value = true;
  errorMessage.value = '';

  try {
    await authStore.changeUsername(username.value.trim());
    void router.back();
  } catch (err: unknown) {
    const apiErr = (
      err as { response?: { data?: { error?: { code?: string; message?: string } } } }
    )?.response?.data?.error;

    switch (apiErr?.code) {
      case 'USERNAME_TAKEN':
        statusType.value = 'error';
        errorMessage.value = t('pages.changeUsername.errorTaken');
        break;
      case 'USERNAME_RESERVED':
        statusType.value = 'error';
        errorMessage.value = t('pages.changeUsername.errorReserved');
        break;
      case 'USERNAME_CHANGE_TOO_SOON':
        statusType.value = 'error';
        errorMessage.value = t('pages.changeUsername.errorCooldown');
        break;
      default:
        errorMessage.value = apiErr?.message ?? t('pages.changeUsername.saveFailed');
    }
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped lang="scss">
// Override global 100% to use dynamic viewport height on this form page
.change-username-page {
  min-height: 100dvh;
}

.page-scroll {
  padding: 24px 16px 48px;
}

.form-card {
  background: rgba(255, 255, 255, 0.06);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 20px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
}

// ── Cooldown ──────────────────────────────────────────────────────────────────

.cooldown-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 159, 10, 0.12);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #ff9f0a;
}

.cooldown-icon {
  flex-shrink: 0;
}

// ── Input ─────────────────────────────────────────────────────────────────────

.field-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 0 14px;
  border: 1.5px solid transparent;
  transition: border-color 0.2s;

  &--error {
    border-color: rgba(255, 69, 58, 0.6);
  }
  &--success {
    border-color: rgba(48, 209, 88, 0.6);
  }
}

.username-prefix {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.35);
}

.field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  padding: 14px 0;
  font-family: inherit;
  letter-spacing: 0.02em;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
  &:disabled {
    opacity: 0.4;
  }
}

.status-icon {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── Feedback ──────────────────────────────────────────────────────────────────

.feedback {
  font-size: 13px;
  margin: 0;

  &--error {
    color: #ff453a;
  }
  &--success {
    color: #30d158;
  }
}

// ── Suggestions ───────────────────────────────────────────────────────────────

.suggestions-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 8px;
}

.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  background: rgba(10, 132, 255, 0.15);
  border: none;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 14px;
  color: #0a84ff;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

// ── Save button ───────────────────────────────────────────────────────────────

.save-btn {
  width: 100%;
  height: 50px;
  border-radius: 13px;
  border: none;
  background: #0a84ff;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
  font-family: inherit;

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  &:not(:disabled):active {
    opacity: 0.8;
  }
}

.policy-note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  margin: 0;
}

// ── Fade transition ───────────────────────────────────────────────────────────

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
