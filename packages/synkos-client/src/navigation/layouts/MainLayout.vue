<template>
  <div class="app-layout">
    <!-- ── iOS Navigation Bar ────────────────────────────────────── -->
    <header class="ios-nav-bar">
      <div class="ios-nav-content">
        <!-- Back button — visible on sub-routes -->
        <button v-if="isSubRoute" class="ios-back-btn" @click="goBack">
          <AppIcon name="chevron_left" size="28px" />
          <span class="ios-back-label">{{ parentTitle }}</span>
        </button>

        <!-- Page title — crossfades when large title collapses into nav bar -->
        <Transition name="nav-title-fade">
          <span
            :key="pageTitle"
            class="ios-nav-title"
            :class="{ 'ios-nav-title--sub': isSubRoute }"
          >
            {{ pageTitle }}
          </span>
        </Transition>

        <!-- Trailing action: injected by page via useNavAction, or menu on /profile -->
        <button
          v-if="navTrailingAction || route.path === '/profile'"
          class="ios-menu-btn"
          @click="navTrailingAction ? navTrailingAction.onClick() : (showMenu = true)"
        >
          <AppIcon :name="navTrailingAction?.icon ?? 'menu'" size="22px" />
        </button>
      </div>
    </header>

    <!-- ── Drawers & overlays ─────────────────────────────────────── -->
    <AppMenuDrawer v-model="showMenu" />

    <!-- ── Scrollable page area ───────────────────────────────────── -->
    <main class="page-container">
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
    </main>

    <!-- ── iOS Tab Bar ────────────────────────────────────────────── -->
    <footer v-if="!route.meta.hideTabBar" class="ios-tab-bar">
      <div class="ios-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.path"
          class="ios-tab"
          :class="{ 'ios-tab--active': isTabActive(tab) }"
          @click="navigate(tab.path)"
        >
          <div class="ios-tab-icon-wrap">
            <AppIcon :name="tab.icon" size="22px" class="ios-tab-icon" />
            <span v-if="tab.badge > 0" class="ios-tab-badge">
              {{ tab.badge > 99 ? '99+' : tab.badge }}
            </span>
          </div>
          <span class="ios-tab-label">{{ tab.label }}</span>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, isRef, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import DeletionBanner from '../../vue/components/navigation/DeletionBanner.vue';
import AppMenuDrawer from '../../vue/components/navigation/AppMenuDrawer.vue';
import { AppIcon } from '@synkos/ui';
import { getClientConfig } from '../../internal/app-config.js';
import { getTabConfig } from '../internal/tab-config.js';
import { navTrailingAction, navTitleOverride, setNavTitle } from '../internal/nav-state.js';

const appConfig = getClientConfig();

// Provide the nav title setter so AppPageLargeTitle (in @synkos/ui) can inject it
// without creating a circular package dependency.
provide('synkos:set-nav-title', (title: string | null) => setNavTitle(title));
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// ── Tabs — driven by getTabConfig() set in createSynkosRouter ──────
const allTabs = getTabConfig();

const tabs = computed(() =>
  allTabs.map((tab) => ({
    path: tab.path,
    name: tab.name,
    label: t(tab.labelKey),
    icon: tab.icon,
    badge: isRef(tab.badge) ? tab.badge.value : (tab.badge ?? 0),
  }))
);

// keep-alive: include tabs that opt in with cache: true.
// componentName takes priority; falls back to "${Name}Page" convention.
const cachedViews = allTabs
  .filter((tab) => tab.cache)
  .map((tab) => tab.componentName ?? tab.name.charAt(0).toUpperCase() + tab.name.slice(1) + 'Page');

const tabTransition = ref('tab-slide-left');
const showMenu = ref(false);

// ── Route helpers ──────────────────────────────────────────────────
const isSubRoute = computed(() => tabs.value.every((tab) => tab.path !== route.path));

const pageTitle = computed(() => {
  if (navTitleOverride.value !== null) return navTitleOverride.value;
  if (route.meta?.titleKey) return t(route.meta.titleKey as string);
  return appConfig.name;
});

const parentTitle = computed(() => {
  if (route.meta?.parentTitleKey) return t(route.meta.parentTitleKey as string);
  return t('nav.back');
});

const routeKey = computed(() => route.path);

// ── Tab active state ───────────────────────────────────────────────
function isTabActive(tab: { path: string }) {
  if (tab.path === '/') return route.path === '/';
  if (tab.path === '/profile') {
    return route.path === '/profile' || route.path.startsWith('/settings');
  }
  return route.path.startsWith(tab.path);
}

// ── Navigation ─────────────────────────────────────────────────────
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
// ─── Root layout ──────────────────────────────────────────────────
// Flexbox column fills the fixed body. Header and footer are rigid;
// page-container takes all remaining height.
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}

// ─── Navigation Bar ───────────────────────────────────────────────
.ios-nav-bar {
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0px);
  background: var(--glass-bg, #{$glass-bg});
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-bottom: 0.5px solid var(--glass-border, #{$glass-border});
  z-index: $z-raised;
  position: relative;
}

.ios-nav-content {
  height: var(--nav-content-size, 44px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 $space-8;
}

.ios-nav-title {
  font-size: $font-body-lg;
  font-weight: 600;
  color: var(--text-primary, #{$text-primary});
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
  color: var(--text-muted, #{$text-muted});
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
  color: var(--color-primary, #{$primary});
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
  color: var(--color-primary, #{$primary});
  letter-spacing: $ls-base;
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// ─── Page container ───────────────────────────────────────────────
// flex: 1 takes all remaining height. position: relative makes it the
// containing block for .page-stack which uses position: absolute.
.page-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

// ─── Page stack (banner + scroll area) ───────────────────────────
// position: absolute; inset: 0 fills page-container completely, giving
// .slide-wrapper a PIXEL-DEFINITE parent height — no chain of flex: 1
// percentages that break on iOS WebKit. DeletionBanner sits in flex flow
// so slide-wrapper shrinks naturally when the banner is visible.
.page-stack {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// ─── Scroll wrapper ───────────────────────────────────────────────
.slide-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

// ─── Tab Bar ──────────────────────────────────────────────────────
.ios-tab-bar {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--glass-bg, #{$glass-bg});
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-top: 0.5px solid var(--glass-border, #{$glass-border});
  z-index: $z-raised;
  position: relative;
}

.ios-tabs {
  height: var(--tab-bar-height, 49px);
  display: flex;
  align-items: stretch;
}

.ios-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  color: var(--text-disabled, rgba(255, 255, 255, 0.4));
  transition: color $transition-quick;
  -webkit-tap-highlight-color: transparent;
  outline: none;

  &--active {
    color: var(--color-primary, #{$primary});
  }

  &:active {
    opacity: 0.6;
  }
}

.ios-tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.ios-tab-icon {
  line-height: 1;
}

.ios-tab-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 9999px;
  background: #ff3b30;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  letter-spacing: 0;
  pointer-events: none;
}

.ios-tab-label {
  font-size: $font-xs;
  font-weight: 500;
  letter-spacing: 0.1px;
  line-height: 1;
}
</style>

<!-- Non-scoped: transition classes are applied by Vue to dynamically-loaded
     route components. Scoped selectors (data-v-xxx) are not reliable across
     keep-alive + router-view component boundaries in all WebKit versions. -->
<style lang="scss">
// ─── Tab push transitions ─────────────────────────────────────────
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: transform var(--platform-transition-push, 0.32s cubic-bezier(0.36, 0.66, 0.04, 1));
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

// ─── Nav bar title crossfade (large title collapse) ───────────────
// position: absolute lets enter/leave overlap so it looks like a crossfade
// instead of two titles stacking vertically.
.nav-title-fade-enter-active,
.nav-title-fade-leave-active {
  transition: opacity 0.2s ease;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}
.nav-title-fade-enter-from,
.nav-title-fade-leave-to {
  opacity: 0;
}
</style>
