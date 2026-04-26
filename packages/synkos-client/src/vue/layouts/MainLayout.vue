<template>
  <q-layout view="hHh lpR fFf">
    <!-- iOS Navigation Bar -->
    <q-header class="ios-nav-bar">
      <div class="ios-nav-content">
        <!-- Back button (sub-routes) -->
        <button v-if="isSubRoute" class="ios-back-btn" @click="goBack">
          <q-icon name="chevron_left" size="28px" />
          <span class="ios-back-label">{{ parentTitle }}</span>
        </button>

        <!-- Title -->
        <span class="ios-nav-title" :class="{ 'ios-nav-title--sub': isSubRoute }">
          {{ pageTitle }}
        </span>

        <!-- Menu button (profile route only) -->
        <button v-if="route.path === '/profile'" class="ios-menu-btn" @click="showMenu = true">
          <q-icon name="menu" size="22px" />
        </button>
      </div>
    </q-header>

    <AppMenuDrawer v-model="showMenu" />

    <q-page-container>
      <div class="page-stack">
        <DeletionBanner />
        <div class="slide-wrapper">
          <router-view v-slot="{ Component }">
            <transition :name="tabTransition">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="routeKey" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </q-page-container>

    <!-- iOS Tab Bar -->
    <q-footer class="ios-tab-bar">
      <div class="ios-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          class="ios-tab"
          :class="{ 'ios-tab--active': isTabActive(tab) }"
          @click="navigate(tab.path)"
        >
          <q-icon :name="tab.icon" class="ios-tab-icon" />
          <span class="ios-tab-label">{{ tab.label }}</span>
        </button>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import DeletionBanner from '../components/navigation/DeletionBanner.vue';
import AppMenuDrawer from '../components/navigation/AppMenuDrawer.vue';
import { getClientConfig } from '../../internal/app-config.js';
const appConfig = getClientConfig();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Reactive tabs — labels update immediately when locale changes.
// Add your app's feature tabs here alongside the core home/profile tabs.
const tabs = computed(() => [
  { path: '/', label: t('tabs.home'), icon: 'home' },
  { path: '/profile', label: t('tabs.profile'), icon: 'person' },
]);

// Pages whose component instances should survive keep-alive when navigating within a tab
const cachedViews = ['HomePage'];

const tabTransition = ref('tab-slide-left');
const showMenu = ref(false);

// ── Route helpers ─────────────────────────────────────────────────
const isSubRoute = computed(() => tabs.value.every((tab) => tab.path !== route.path));

const pageTitle = computed(() => {
  if (route.path === '/profile') return t('tabs.profile');
  // Feature pages declare their title as an i18n key in route meta
  if (route.meta?.titleKey) return t(route.meta.titleKey);
  return appConfig.name;
});

const parentTitle = computed(() => {
  // Feature pages declare their back-button label as an i18n key in route meta
  if (route.meta?.parentTitleKey) return t(route.meta.parentTitleKey);
  return t('nav.back');
});

const routeKey = computed(() => route.path);

// ── Tab active state ──────────────────────────────────────────────
function isTabActive(tab: { path: string }) {
  if (tab.path === '/') return route.path === '/';
  // All /settings/* routes are sub-pages of the profile tab
  if (tab.path === '/profile') {
    return route.path === '/profile' || route.path.startsWith('/settings');
  }
  return route.path.startsWith(tab.path);
}

// ── Navigation ────────────────────────────────────────────────────
function navigate(path: string) {
  const currentTab = tabs.value.find((t) => isTabActive(t));
  const targetTab = tabs.value.find((t) => t.path === path);
  if (!targetTab || currentTab?.path === path) return;

  const currentIndex = tabs.value.indexOf(currentTab!);
  const targetIndex = tabs.value.indexOf(targetTab);
  void Haptics.impact({ style: ImpactStyle.Light });
  tabTransition.value = targetIndex > currentIndex ? 'tab-slide-left' : 'tab-slide-right';
  void router.push(path);
}

function goBack() {
  void Haptics.impact({ style: ImpactStyle.Light });
  tabTransition.value = 'tab-slide-right';
  void router.back();
  setTimeout(() => {
    tabTransition.value = 'tab-slide-left';
  }, 350);
}
</script>

<style lang="scss" scoped>
// ─── Navigation Bar ───────────────────────────────────────────────
.ios-nav-bar {
  padding-top: env(safe-area-inset-top, 0px);
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-bottom: 0.5px solid $glass-border;
  box-shadow: none;
}

.ios-nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 $space-8;
}

.ios-nav-title {
  font-size: $font-body-lg;
  font-weight: 600;
  color: $text-primary;
  letter-spacing: $ls-base;

  &--sub {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}

// ─── Menu button ──────────────────────────────────────────────────
.ios-menu-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: $text-muted;
  padding: $space-3;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.5;
  }
}

// ─── Back button ──────────────────────────────────────────────────
.ios-back-btn {
  display: flex;
  align-items: center;
  gap: 1px;
  background: transparent;
  border: none;
  color: $primary;
  font-size: $font-body-lg;
  font-weight: 400;
  cursor: pointer;
  padding: 0 $space-2 0 0;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  position: relative;
  z-index: $z-raised;
  margin-right: auto;

  &:active {
    opacity: 0.5;
  }
}

.ios-back-label {
  font-size: $font-body-lg;
  font-weight: 400;
  color: $primary;
  letter-spacing: $ls-base;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ─── Tab Bar ──────────────────────────────────────────────────────
.ios-tab-bar {
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: $glass-bg;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-top: 0.5px solid $glass-border;
}

.ios-tabs {
  height: 49px;
  display: flex;
  align-items: stretch;
}

.ios-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $space-1 + 1;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: rgba(255, 255, 255, 0.4);
  transition: color $transition-quick;
  -webkit-tap-highlight-color: transparent;
  outline: none;

  &--active {
    color: $primary;
  }
  &:active {
    opacity: 0.6;
  }
}

.ios-tab-icon {
  font-size: 22px !important;
  line-height: 1;
}
.ios-tab-label {
  font-size: $font-xs;
  font-weight: 500;
  letter-spacing: 0.1px;
  line-height: 1;
}

// ─── Page stack (banner + scroll area) ───────────────────────────
// Flex column so the banner takes its natural height and slide-wrapper
// gets exactly the remaining space — prevents bottom-content clipping.
.page-stack {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// ─── Scroll wrapper ───────────────────────────────────────────────
.slide-wrapper {
  position: relative;
  flex: 1;
  min-height: 0; // required: flex children don't shrink below content size by default
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

// ─── Tab push transitions ─────────────────────────────────────────
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: transform $transition-spring;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.tab-slide-left-enter-from {
  transform: translateX(100%);
}
.tab-slide-left-leave-to {
  transform: translateX(-30%);
}

.tab-slide-right-enter-from {
  transform: translateX(-30%);
}
.tab-slide-right-leave-to {
  transform: translateX(100%);
}
</style>
