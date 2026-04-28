<template>
  <AppPage class="profile-page">
    <div class="profile-scroll">
      <!-- ── Avatar + name ─────────────────────────────────────────── -->
      <ProfileHeader
        :avatar="authStore.user?.avatar"
        :display-name="authStore.user?.displayName"
        :email="authStore.user?.email"
        :is-authenticated="authStore.isAuthenticated"
        :providers="authStore.user?.providers"
        @sign-in="goToLogin"
      />

      <!-- ── Stats ─────────────────────────────────────────────────── -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">{{ t('pages.profile.stats.stat1') }}</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">{{ t('pages.profile.stats.stat2') }}</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-card">
          <span class="stat-value">0</span>
          <span class="stat-label">{{ t('pages.profile.stats.stat3') }}</span>
        </div>
      </div>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AppPage } from '@synkos/ui';
import { useRouter } from 'vue-router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuthStore } from '@synkos/client';
import ProfileHeader from './components/ProfileHeader.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

function goToLogin() {
  void Haptics.impact({ style: ImpactStyle.Light });
  void router.push({ name: 'auth-login' });
}
</script>

<style lang="scss" scoped>
// if a page-level override is ever needed.
.profile-scroll {
  padding-bottom: $space-16;
}

// ── Stats ─────────────────────────────────────────────────────────────
.stats-row {
  display: flex;
  align-items: center;
  margin: 0 $space-8 $space-4;
  background: $surface-1;
  border: 0.5px solid $surface-1-border;
  border-radius: $radius-2xl;
  padding: $space-8 0;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1 + 1;
}

.stat-value {
  font-size: $font-title;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: $ls-tighter;
  line-height: $lh-tight;
}

.stat-label {
  font-size: $font-sm;
  font-weight: 500;
  color: $text-label;
  letter-spacing: 0.1px;
  text-transform: uppercase;
}

.stat-divider {
  width: 0.5px;
  height: 32px;
  background: $border-medium;
}
</style>
