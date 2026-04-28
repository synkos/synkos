<template>
  <AppPage class="edit-profile-page">
    <div class="edit-scroll">
      <!-- ── Avatar ─────────────────────────────────────────────────── -->
      <div class="section-wrap">
        <p class="section-label">{{ t('pages.editProfile.sections.photo') }}</p>
        <div class="list-group">
          <div class="photo-row">
            <div class="avatar-preview" @click="pickPhoto">
              <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" class="avatar-img" />
              <AppIcon v-else name="person" size="40px" style="color: #fff" />
              <div class="avatar-overlay">
                <AppIcon name="photo_camera" size="18px" style="color: #fff" />
              </div>
            </div>

            <div class="photo-actions">
              <button class="text-btn text-btn--blue" @click="pickPhoto" :disabled="photoLoading">
                {{ t('pages.editProfile.photo.change') }}
              </button>
              <button
                v-if="authStore.user?.avatar || avatarPreviewUrl"
                class="text-btn text-btn--red"
                @click="confirmRemovePhoto"
                :disabled="photoLoading"
              >
                {{ t('pages.editProfile.photo.remove') }}
              </button>
            </div>

            <AppSpinner v-if="photoLoading" size="18px" color="primary" style="margin-left: auto" />
          </div>

          <p v-if="photoError" class="field-error">{{ photoError }}</p>

          <!-- Hidden file input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            class="hidden-input"
            @change="onFileSelected"
          />
        </div>
      </div>

      <!-- ── Display Name ───────────────────────────────────────────── -->
      <div class="section-wrap">
        <p class="section-label">{{ t('pages.editProfile.sections.profile') }}</p>
        <div class="list-group">
          <div class="field-row field-row--first">
            <label class="field-label">{{ t('pages.editProfile.name.label') }}</label>
            <div class="field-input-wrap">
              <input
                v-model="nameValue"
                type="text"
                class="field-input"
                :placeholder="t('pages.editProfile.name.placeholder')"
                maxlength="50"
                autocomplete="name"
                autocorrect="off"
                @input="onNameInput"
                @blur="saveName"
                @keyup.enter="saveName"
              />
              <AppSpinner v-if="nameLoading" size="16px" color="primary" />
              <AppIcon
                v-else-if="nameSaved"
                name="check_circle"
                size="18px"
                style="color: var(--color-positive)"
              />
            </div>
          </div>
          <p v-if="nameError" class="field-error field-error--padded">{{ nameError }}</p>

          <!-- ── Username ─────────────────────────────────────────── -->
          <div class="row-separator" />

          <div class="field-row field-row--last">
            <label class="field-label">{{ t('pages.editProfile.username.label') }}</label>
            <button class="username-chevron-btn" @click="goToChangeUsername">
              <span class="username-current">
                {{ authStore.user?.username ?? t('pages.editProfile.username.notSet') }}
              </span>
              <AppIcon name="chevron_right" class="row-chevron" />
            </button>
          </div>

          <p v-if="usernameCooldownMsg" class="field-hint field-hint--padded">
            {{ usernameCooldownMsg }}
          </p>
        </div>
      </div>

      <!-- ── Security ───────────────────────────────────────────────── -->
      <div v-if="hasLocalProvider" class="section-wrap">
        <p class="section-label">{{ t('pages.editProfile.sections.security') }}</p>
        <div class="list-group">
          <button class="list-row list-row--first list-row--last" @click="goToChangePassword">
            <div class="row-icon-wrap" style="background: rgba(255, 159, 10, 0.15)">
              <AppIcon name="lock" size="18px" style="color: #ff9f0a" />
            </div>
            <div class="row-content">
              <span class="row-title">{{ t('pages.editProfile.password.label') }}</span>
              <span class="row-hint">{{ t('pages.editProfile.password.hint') }}</span>
            </div>
            <AppIcon name="chevron_right" class="row-chevron" />
          </button>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { AppPage, AppIcon, AppSpinner } from '@synkos/ui';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@synkos/client';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// ── Computed ──────────────────────────────────────────────────────────────────

const hasLocalProvider = computed(() => authStore.user?.providers.includes('local') ?? false);

const usernameCooldownMsg = computed(() => {
  const changedAt = authStore.user?.usernameChangedAt;
  if (!changedAt) return null;

  const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
  const nextAllowed = new Date(new Date(changedAt).getTime() + COOLDOWN_MS);
  const now = new Date();
  if (nextAllowed <= now) return null;

  const daysLeft = Math.ceil((nextAllowed.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  return t('pages.editProfile.username.cooldown', { days: daysLeft });
});

// ── Display Name ──────────────────────────────────────────────────────────────

const nameValue = ref('');
const nameLoading = ref(false);
const nameError = ref('');
const nameSaved = ref(false);
let nameSavedTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  nameValue.value = authStore.user?.displayName ?? '';
});

function onNameInput() {
  nameError.value = '';
  nameSaved.value = false;
}

async function saveName() {
  const trimmed = nameValue.value.trim();

  // No-op if unchanged
  if (trimmed === authStore.user?.displayName) return;
  if (!trimmed) {
    nameError.value = t('pages.editProfile.name.required');
    return;
  }

  nameLoading.value = true;
  nameError.value = '';
  nameSaved.value = false;

  try {
    await authStore.updateName(trimmed);
    nameSaved.value = true;
    if (nameSavedTimer) clearTimeout(nameSavedTimer);
    nameSavedTimer = setTimeout(() => {
      nameSaved.value = false;
    }, 2500);
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
      ?.error?.message;
    nameError.value = msg ?? t('pages.editProfile.name.saveFailed');
    nameValue.value = authStore.user?.displayName ?? '';
  } finally {
    nameLoading.value = false;
  }
}

// ── Photo ─────────────────────────────────────────────────────────────────────

const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreviewUrl = ref<string | null>(authStore.user?.avatar ?? null);
const photoLoading = ref(false);
const photoError = ref('');

function pickPhoto() {
  fileInputRef.value?.click();
}

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Local preview before upload
  const objectUrl = URL.createObjectURL(file);
  avatarPreviewUrl.value = objectUrl;
  photoError.value = '';
  photoLoading.value = true;

  try {
    await authStore.updatePhoto(file);
    // Swap preview for the real server URL
    avatarPreviewUrl.value = authStore.user?.avatar ?? objectUrl;
    URL.revokeObjectURL(objectUrl);
  } catch (err: unknown) {
    const code = (err as { response?: { data?: { error?: { code?: string; message?: string } } } })
      ?.response?.data?.error;
    if (code?.code === 'STORAGE_NOT_CONFIGURED') {
      photoError.value = t('pages.editProfile.photo.notAvailable');
    } else {
      photoError.value = code?.message ?? t('pages.editProfile.photo.uploadFailed');
    }
    // Roll back preview
    avatarPreviewUrl.value = authStore.user?.avatar ?? null;
    URL.revokeObjectURL(objectUrl);
  } finally {
    photoLoading.value = false;
    // Reset input so the same file can be re-selected
    input.value = '';
  }
}

async function confirmRemovePhoto() {
  photoError.value = '';
  photoLoading.value = true;
  const previous = avatarPreviewUrl.value;
  avatarPreviewUrl.value = null;

  try {
    await authStore.removePhoto();
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
      ?.error?.message;
    photoError.value = msg ?? t('pages.editProfile.photo.removeFailed');
    avatarPreviewUrl.value = previous;
  } finally {
    photoLoading.value = false;
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function goToChangeUsername() {
  void router.push({ name: 'settings-account-username' });
}

function goToChangePassword() {
  void router.push({ name: 'settings-account-password' });
}
</script>

<style scoped lang="scss">
// Override global 100% to use dynamic viewport height on this form page
.edit-profile-page {
  min-height: 100dvh;
}

.edit-scroll {
  padding: 16px 0 48px;
}

// ── Section ───────────────────────────────────────────────────────────────────

.section-wrap {
  margin: 0 0 28px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.45);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 0 20px;
  margin: 0 0 8px;
}

.list-group {
  background: rgba(255, 255, 255, 0.06);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  margin: 0 16px;
  overflow: hidden;
}

.row-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 0 16px;
}

// ── Photo row ─────────────────────────────────────────────────────────────────

.photo-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.avatar-preview {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;

  &:active {
    opacity: 0.75;
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.photo-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  padding: 4px 0;
  text-align: left;

  &--blue {
    color: #0a84ff;
  }
  &--red {
    color: #ff453a;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.hidden-input {
  display: none;
}

// ── Field rows ────────────────────────────────────────────────────────────────

.field-row {
  display: flex;
  align-items: center;
  min-height: 50px;
  padding: 0 16px;
  gap: 12px;

  &--first {
    border-radius: 14px 14px 0 0;
  }
  &--last {
    border-radius: 0 0 14px 14px;
  }
}

.field-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  min-width: 72px;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.field-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.55);
  text-align: right;
  min-width: 0;
  font-family: inherit;
}

// ── Username chevron button ───────────────────────────────────────────────────

.username-chevron-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  justify-content: flex-end;

  &:active {
    opacity: 0.6;
  }
}

.username-current {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.55);
}

.row-chevron {
  color: rgba(255, 255, 255, 0.25);
  font-size: 20px;
}

// ── Errors & hints ────────────────────────────────────────────────────────────

.field-error {
  font-size: 13px;
  color: #ff453a;
  margin: 0;
  padding: 4px 16px 12px;

  &--padded {
    padding-left: 16px;
  }
}

.field-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  padding: 4px 16px 12px;

  &--padded {
    padding-left: 16px;
  }
}

// ── Action rows (password) ────────────────────────────────────────────────────

.list-row {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  cursor: pointer;
  gap: 12px;
  text-align: left;

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }
}

.row-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.row-title {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}

.row-hint {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
