<template>
  <AppPage class="change-password-page">
    <div class="page-scroll">
      <div class="form-card">
        <p class="card-subtitle">{{ t('pages.changePassword.subtitle') }}</p>

        <!-- Current password -->
        <div class="field-block">
          <label class="field-label">{{ t('pages.changePassword.current.label') }}</label>
          <div class="field-wrap" :class="{ 'field-wrap--error': !!currentError }">
            <input
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              class="field-input"
              :placeholder="t('pages.changePassword.current.placeholder')"
              autocomplete="current-password"
              @input="currentError = ''"
            />
            <button class="toggle-btn" @click="showCurrent = !showCurrent" type="button">
              <AppIcon :name="showCurrent ? 'visibility_off' : 'visibility'" size="18px" />
            </button>
          </div>
          <p v-if="currentError" class="field-error">{{ currentError }}</p>
        </div>

        <!-- New password -->
        <div class="field-block">
          <label class="field-label">{{ t('pages.changePassword.new.label') }}</label>
          <div class="field-wrap" :class="{ 'field-wrap--error': !!newError }">
            <input
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              class="field-input"
              :placeholder="t('pages.changePassword.new.placeholder')"
              autocomplete="new-password"
              @input="validateNew"
            />
            <button class="toggle-btn" @click="showNew = !showNew" type="button">
              <AppIcon :name="showNew ? 'visibility_off' : 'visibility'" size="18px" />
            </button>
          </div>
          <p v-if="newError" class="field-error">{{ newError }}</p>

          <!-- Rules checklist -->
          <ul class="rules-list">
            <li class="rule-item" :class="{ 'rule-item--met': rules.minLength }">
              <AppIcon
                :name="rules.minLength ? 'check_circle' : 'radio_button_unchecked'"
                size="14px"
              />
              {{ t('pages.changePassword.rules.minLength') }}
            </li>
            <li class="rule-item" :class="{ 'rule-item--met': rules.hasUppercase }">
              <AppIcon
                :name="rules.hasUppercase ? 'check_circle' : 'radio_button_unchecked'"
                size="14px"
              />
              {{ t('pages.changePassword.rules.uppercase') }}
            </li>
            <li class="rule-item" :class="{ 'rule-item--met': rules.hasNumber }">
              <AppIcon
                :name="rules.hasNumber ? 'check_circle' : 'radio_button_unchecked'"
                size="14px"
              />
              {{ t('pages.changePassword.rules.number') }}
            </li>
          </ul>
        </div>

        <!-- Save button -->
        <button class="save-btn" :disabled="!canSave" @click="savePassword">
          <AppSpinner v-if="isSaving" size="18px" color="white" />
          <span v-else>{{ t('pages.changePassword.save') }}</span>
        </button>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { AppPage, AppIcon, AppSpinner } from '@synkos/ui';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../../../auth/store.js';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// ── Fields ────────────────────────────────────────────────────────────────────

const currentPassword = ref('');
const newPassword = ref('');
const showCurrent = ref(false);
const showNew = ref(false);
const currentError = ref('');
const newError = ref('');
const isSaving = ref(false);

// ── Password rules ────────────────────────────────────────────────────────────

const rules = computed(() => ({
  minLength: newPassword.value.length >= 8,
  hasUppercase: /[A-Z]/.test(newPassword.value),
  hasNumber: /[0-9]/.test(newPassword.value),
}));

const newPasswordValid = computed(
  () => rules.value.minLength && rules.value.hasUppercase && rules.value.hasNumber
);

function validateNew() {
  newError.value = '';
}

const canSave = computed(
  () => currentPassword.value.length > 0 && newPasswordValid.value && !isSaving.value
);

// ── Submit ────────────────────────────────────────────────────────────────────

async function savePassword() {
  if (!canSave.value) return;

  if (currentPassword.value === newPassword.value) {
    newError.value = t('pages.changePassword.errors.samePassword');
    return;
  }

  isSaving.value = true;
  currentError.value = '';
  newError.value = '';

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value);

    // Password change invalidates all sessions — return to login
    await authStore.logout();
    void router.replace({ name: 'auth-login' });
  } catch (err: unknown) {
    const apiErr = (
      err as { response?: { data?: { error?: { code?: string; message?: string } } } }
    )?.response?.data?.error;

    switch (apiErr?.code) {
      case 'INVALID_CURRENT_PASSWORD':
        currentError.value = t('pages.changePassword.errors.invalidCurrent');
        break;
      case 'NOT_LOCAL_ACCOUNT':
        currentError.value = t('pages.changePassword.errors.notLocalAccount');
        break;
      case 'PASSWORD_SAME_AS_CURRENT':
        newError.value = t('pages.changePassword.errors.samePassword');
        break;
      default:
        newError.value = apiErr?.message ?? t('pages.changePassword.errors.generic');
    }
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped lang="scss">
// Override global 100% to use dynamic viewport height on this form page
.change-password-page {
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
  gap: 20px;
}

.card-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.5;
}

// ── Field ─────────────────────────────────────────────────────────────────────

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  border: 1.5px solid transparent;
  padding: 0 14px;
  transition: border-color 0.2s;

  &--error {
    border-color: rgba(255, 69, 58, 0.6);
  }
}

.field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  padding: 14px 0;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: rgba(255, 255, 255, 0.35);

  &:active {
    opacity: 0.6;
  }
}

.field-error {
  font-size: 13px;
  color: #ff453a;
  margin: 0;
}

// ── Rules checklist ───────────────────────────────────────────────────────────

.rules-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  transition: color 0.2s;

  &--met {
    color: #30d158;
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
</style>
