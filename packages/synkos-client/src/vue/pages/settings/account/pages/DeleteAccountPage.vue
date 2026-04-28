<template>
  <AppPage class="delete-page">
    <!-- ── Step 1: Information ───────────────────────────────────────────── -->
    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="step1" class="step-container">
        <div class="icon-wrap">
          <AppIcon name="warning_amber" class="danger-icon" />
        </div>
        <h1 class="step-title">{{ t('pages.deleteAccount.step1.title') }}</h1>
        <p class="step-subtitle">{{ t('pages.deleteAccount.step1.subtitle') }}</p>

        <ul class="info-list">
          <li class="info-item">
            <AppIcon name="schedule" class="info-icon" />
            <span>{{ t('pages.deleteAccount.step1.grace') }}</span>
          </li>
          <li class="info-item">
            <AppIcon name="block" class="info-icon" />
            <span>{{ t('pages.deleteAccount.step1.accessBlocked') }}</span>
          </li>
          <li class="info-item">
            <AppIcon name="delete_forever" class="info-icon" />
            <span>{{ t('pages.deleteAccount.step1.dataDeleted') }}</span>
          </li>
          <li class="info-item">
            <AppIcon name="undo" class="info-icon info-icon--green" />
            <span>{{ t('pages.deleteAccount.step1.reversible') }}</span>
          </li>
        </ul>

        <div class="retention-box">
          <p class="retention-title">{{ t('pages.deleteAccount.step1.retainedTitle') }}</p>
          <p class="retention-body">{{ t('pages.deleteAccount.step1.retainedBody') }}</p>
        </div>

        <div class="actions">
          <button class="btn btn--danger" @click="step = 2">
            {{ t('pages.deleteAccount.step1.continue') }}
          </button>
          <button class="btn btn--ghost" @click="goBack">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>

      <!-- ── Step 2: Confirmation ──────────────────────────────────────── -->
      <div v-else-if="step === 2" key="step2" class="step-container">
        <div class="icon-wrap">
          <AppIcon name="lock" class="danger-icon" />
        </div>
        <h1 class="step-title">{{ t('pages.deleteAccount.step2.title') }}</h1>
        <p class="step-subtitle">{{ t('pages.deleteAccount.step2.subtitle') }}</p>

        <!-- Password field — only for local auth users -->
        <div v-if="hasLocalProvider" class="field-wrap">
          <input
            v-model="password"
            type="password"
            class="text-input"
            :placeholder="t('pages.deleteAccount.step2.passwordPlaceholder')"
            autocomplete="current-password"
            @keyup.enter="submitDeletion"
          />
        </div>

        <!-- Confirmation word -->
        <div class="field-wrap">
          <p class="confirm-hint">
            {{ t('pages.deleteAccount.step2.typeToConfirm') }}
            <strong class="confirm-word">DELETE</strong>
          </p>
          <input
            v-model="confirmWord"
            type="text"
            class="text-input"
            :placeholder="t('pages.deleteAccount.step2.confirmPlaceholder')"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @keyup.enter="submitDeletion"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <div class="actions">
          <button
            class="btn btn--danger"
            :disabled="!canSubmit || isLoading"
            @click="submitDeletion"
          >
            <AppSpinner v-if="isLoading" size="18px" color="white" />
            <span v-else>{{ t('pages.deleteAccount.step2.confirm') }}</span>
          </button>
          <button class="btn btn--ghost" :disabled="isLoading" @click="step = 1">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>

      <!-- ── Step 3: Scheduled ─────────────────────────────────────────── -->
      <div v-else key="step3" class="step-container step-container--center">
        <div class="icon-wrap">
          <AppIcon name="check_circle" class="success-icon" />
        </div>
        <h1 class="step-title">{{ t('pages.deleteAccount.step3.title') }}</h1>
        <p class="step-subtitle">
          {{ t('pages.deleteAccount.step3.subtitle', { date: formattedDeletionDate }) }}
        </p>

        <div class="deletion-date-box">
          <p class="deletion-date-label">{{ t('pages.deleteAccount.step3.scheduledFor') }}</p>
          <p class="deletion-date-value">{{ formattedDeletionDate }}</p>
        </div>

        <p class="cancel-hint">{{ t('pages.deleteAccount.step3.cancelHint') }}</p>

        <div class="actions">
          <button class="btn btn--ghost-danger" :disabled="isCancelling" @click="cancelDeletion">
            <AppSpinner v-if="isCancelling" size="18px" color="white" />
            <span v-else>{{ t('pages.deleteAccount.step3.cancelDeletion') }}</span>
          </button>
          <button class="btn btn--ghost" @click="goHome">
            {{ t('pages.deleteAccount.step3.done') }}
          </button>
        </div>
      </div>
    </transition>
  </AppPage>
</template>

<script setup lang="ts">
import { AppPage, AppIcon, AppSpinner } from '@synkos/ui';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../../../../auth/store.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// If already pending deletion, jump straight to the scheduled screen
const initialScheduledAt = authStore.deletionScheduledAt;
const step = ref(authStore.isPendingDeletion ? 3 : 1);
const password = ref('');
const confirmWord = ref('');
const errorMsg = ref('');
const isLoading = ref(false);
const isCancelling = ref(false);
const scheduledAt = ref<Date | null>(initialScheduledAt);

const hasLocalProvider = computed(() => authStore.user?.providers.includes('local') ?? false);

const canSubmit = computed(() => {
  const wordOk = confirmWord.value === 'DELETE';
  if (hasLocalProvider.value) return wordOk && password.value.length > 0;
  return wordOk;
});

const formattedDeletionDate = computed(() => {
  const date = scheduledAt.value ?? authStore.deletionScheduledAt;
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

async function submitDeletion() {
  if (!canSubmit.value || isLoading.value) return;
  errorMsg.value = '';
  isLoading.value = true;

  try {
    const result = await authStore.requestDeletion(
      hasLocalProvider.value ? password.value : undefined
    );
    scheduledAt.value = result.scheduledAt;
    step.value = 3;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 401) {
      errorMsg.value = t('pages.deleteAccount.step2.errors.wrongPassword');
    } else {
      errorMsg.value = t('pages.deleteAccount.step2.errors.generic');
    }
  } finally {
    isLoading.value = false;
  }
}

async function cancelDeletion() {
  if (isCancelling.value) return;
  isCancelling.value = true;
  try {
    await authStore.cancelDeletion();
    void router.replace({ name: 'settings-account' });
  } catch {
    // Non-critical — user can try again from the banner
  } finally {
    isCancelling.value = false;
  }
}

function goBack() {
  router.back();
}

function goHome() {
  void router.replace({ name: 'home' });
}
</script>

<style lang="scss" scoped>
// q-page background and min-height handled globally; keep flex layout for step containers
.delete-page {
  display: flex;
  flex-direction: column;
}

// ── Step container ────────────────────────────────────────────────────────
.step-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 32px 24px 40px;

  &--center {
    align-items: center;
    text-align: center;
  }
}

// ── Icon ──────────────────────────────────────────────────────────────────
.icon-wrap {
  margin-bottom: 20px;
}

.danger-icon {
  font-size: 52px !important;
  color: #ff453a;
}

.success-icon {
  font-size: 52px !important;
  color: #32d74b;
}

// ── Typography ────────────────────────────────────────────────────────────
.step-title {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.4px;
  margin: 0 0 8px;
}

.step-subtitle {
  font-size: 15px;
  color: rgba(235, 235, 245, 0.6);
  line-height: 1.5;
  margin: 0 0 24px;
}

// ── Info list ─────────────────────────────────────────────────────────────
.info-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  color: rgba(235, 235, 245, 0.75);
  line-height: 1.45;
}

.info-icon {
  font-size: 18px !important;
  color: #ff453a;
  flex-shrink: 0;
  margin-top: 1px;

  &--green {
    color: #32d74b;
  }
}

// ── Retention box ─────────────────────────────────────────────────────────
.retention-box {
  background: rgba(255, 255, 255, 0.05);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 28px;
}

.retention-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.retention-body {
  font-size: 13px;
  color: rgba(235, 235, 245, 0.55);
  line-height: 1.5;
  margin: 0;
}

// ── Fields ────────────────────────────────────────────────────────────────
.field-wrap {
  margin-bottom: 16px;
}

.text-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.07);
  border: 0.5px solid rgba(255, 255, 255, 0.13);
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  outline: none;
  -webkit-appearance: none;

  &::placeholder {
    color: rgba(235, 235, 245, 0.28);
  }

  &:focus {
    border-color: rgba(255, 69, 58, 0.55);
  }
}

.confirm-hint {
  font-size: 13px;
  color: rgba(235, 235, 245, 0.55);
  margin: 0 0 10px;

  .confirm-word {
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 1px;
  }
}

.error-msg {
  font-size: 13px;
  color: #ff453a;
  margin: 0 0 16px;
}

// ── Deletion date box ─────────────────────────────────────────────────────
.deletion-date-box {
  background: rgba(255, 69, 58, 0.08);
  border: 0.5px solid rgba(255, 69, 58, 0.25);
  border-radius: 14px;
  padding: 18px 24px;
  margin: 8px 0 20px;
  min-width: 240px;
}

.deletion-date-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: rgba(255, 69, 58, 0.7);
  margin: 0 0 4px;
}

.deletion-date-value {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.cancel-hint {
  font-size: 13px;
  color: rgba(235, 235, 245, 0.45);
  line-height: 1.5;
  max-width: 280px;
  margin: 0 0 28px;
}

// ── Actions ───────────────────────────────────────────────────────────────
.actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s ease;
  letter-spacing: -0.1px;

  &:disabled {
    opacity: 0.38;
    cursor: default;
  }

  &--danger {
    background: #ff453a;
    color: #fff;

    &:active:not(:disabled) {
      opacity: 0.8;
    }
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.07);
    border: 0.5px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.75);

    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
    }
  }

  &--ghost-danger {
    background: rgba(255, 69, 58, 0.1);
    border: 0.5px solid rgba(255, 69, 58, 0.28);
    color: #ff453a;

    &:active:not(:disabled) {
      background: rgba(255, 69, 58, 0.18);
    }
  }
}

// .fade-* transition is defined globally in app.scss
</style>
