<template>
  <div v-if="authStore.isPendingDeletion" class="deletion-banner">
    <div class="banner-content">
      <q-icon name="warning_amber" class="banner-icon" />
      <div class="banner-text">
        <span class="banner-title">{{ t('components.deletionBanner.title') }}</span>
        <span class="banner-date">
          {{ t('components.deletionBanner.date', { date: formattedDate }) }}
        </span>
      </div>
    </div>
    <button class="banner-action" @click="goToDelete">
      {{ t('components.deletionBanner.manage') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth.store';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const formattedDate = computed(() => {
  const d = authStore.deletionScheduledAt;
  if (!d) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
});

function goToDelete() {
  void router.push({ name: 'settings-account-delete' });
}
</script>

<style lang="scss" scoped>
.deletion-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-5;
  background: rgba(255, 69, 58, 0.12);
  border-bottom: 0.5px solid rgba(255, 69, 58, 0.3);
  padding: $space-5 $space-8;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: $space-5;
  flex: 1;
  min-width: 0;
}

.banner-icon {
  font-size: 18px !important;
  color: $negative;
  flex-shrink: 0;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.banner-title {
  font-size: $font-body-sm;
  font-weight: 600;
  color: $negative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-date {
  font-size: $font-sm;
  color: rgba(255, 69, 58, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-action {
  flex-shrink: 0;
  background: rgba(255, 69, 58, 0.15);
  border: 0.5px solid rgba(255, 69, 58, 0.35);
  border-radius: $radius-full;
  color: $negative;
  font-size: $font-caption;
  font-weight: 600;
  padding: 5px 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;

  &:active {
    opacity: 0.75;
  }
}
</style>
