<template>
  <div class="onboarding-layout">
    <!-- ── Header ────────────────────────────────────────────────────── -->
    <header class="onboarding-header">
      <button v-if="canGoBack" class="header-btn" @click="goBack">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
          <path
            d="M8.5 1L1.5 8L8.5 15"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="header-spacer" />
      <button v-if="canSkip" class="header-btn header-btn--skip" @click="skip">
        {{ t('nav.skip', 'Skip') }}
      </button>
    </header>

    <!-- ── Content ───────────────────────────────────────────────────── -->
    <main class="onboarding-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Show the back button on any route except the first step
const canGoBack = computed(() => !!route.meta.canGoBack);

// Show skip on routes that allow it
const canSkip = computed(() => !!route.meta.canSkip);

async function goBack() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  router.back();
}

async function skip() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  // Navigate to the route declared in meta.skipTo, or fall back to home
  const skipTo = route.meta.skipTo;
  await router.replace({ name: skipTo ?? 'home' });
}
</script>

<style lang="scss" scoped>
.onboarding-layout {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-bg, #000);
  overflow: hidden;
}

// ── Header ────────────────────────────────────────────────────────────
.onboarding-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-top: calc(env(safe-area-inset-top, 0px) + $space-6);
  padding-left: $space-8;
  padding-right: $space-8;
  padding-bottom: $space-6;
  min-height: calc(env(safe-area-inset-top, 0px) + 52px);
}

.header-spacer {
  flex: 1;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--surface-1, rgba(255, 255, 255, 0.05));
  color: var(--text-primary, rgba(255, 255, 255, 0.9));
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity $transition-quick;

  &:active {
    opacity: 0.6;
  }

  &--skip {
    width: auto;
    border-radius: $radius-full;
    padding: 0 $space-6;
    font-size: $font-body-sm;
    font-weight: 500;
    color: var(--color-primary, #0a84ff);
    background: transparent;
    letter-spacing: $ls-normal;
  }
}

// ── Content ───────────────────────────────────────────────────────────
.onboarding-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
