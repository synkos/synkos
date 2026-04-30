<template>
  <div class="app-layout">
    <!-- ── iOS Navigation Bar ────────────────────────────────────── -->
    <header class="ios-nav-bar" :class="{ 'is-scrolled': scrolledFromTop }">
      <div class="ios-nav-content">
        <!-- Leading slot. Default: back button on sub-routes. -->
        <slot name="header-left" :is-sub-route="isSubRoute" :parent-title="parentTitle" :go-back="goBack">
          <button v-if="isSubRoute" class="ios-back-btn" @click="goBack">
            <AppIcon name="chevron_left" size="28px" />
            <span class="ios-back-label">{{ parentTitle }}</span>
          </button>
        </slot>

        <!-- Center slot. Default: title with the large-title-collapse crossfade. -->
        <slot name="header-center" :title="pageTitle" :is-sub-route="isSubRoute">
          <Transition name="nav-title-fade">
            <span
              :key="pageTitle"
              class="ios-nav-title"
              :class="{ 'ios-nav-title--sub': isSubRoute }"
            >
              {{ pageTitle }}
            </span>
          </Transition>
        </slot>

        <!-- Trailing slot. Default: nav action injected via useNavAction, or
             the menu drawer button on /profile. -->
        <slot name="header-right" :action="navTrailingAction" :open-menu="() => (showMenu = true)">
          <button
            v-if="navTrailingAction || route.path === '/profile'"
            class="ios-menu-btn"
            @click="navTrailingAction ? navTrailingAction.onClick() : (showMenu = true)"
          >
            <AppIcon :name="navTrailingAction?.icon ?? 'menu'" size="22px" />
          </button>
        </slot>
      </div>
    </header>

    <!-- ── Drawers & overlays ─────────────────────────────────────── -->
    <AppMenuDrawer v-model="showMenu" />

    <!-- ── Scrollable page area ───────────────────────────────────── -->
    <main class="page-container">
      <div class="page-stack">
        <DeletionBanner />
        <div class="slide-wrapper" v-on="edgeSwipe.handlers">
          <router-view v-slot="{ Component }">
            <transition :name="tabTransitionName">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="routeKey" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </main>

    <!-- ── iOS Tab Bar ────────────────────────────────────────────── -->
    <slot
      v-if="!route.meta.hideTabBar"
      name="tab-bar"
      :tabs="tabs"
      :is-active="isTabActive"
      :navigate="navigate"
      :keyboard-open="keyboardOpen"
    >
      <footer class="ios-tab-bar" :class="{ 'is-hidden-by-keyboard': keyboardOpen }">
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
    </slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Main app layout — iOS-style nav bar at the top, tab bar at the bottom, and
 * a scrollable page area in between. Use it as the `component` of the parent
 * route under `/`. Tabs are auto-discovered from `meta.tab` on child routes
 * (see the [routing guide](/docs/guide/routing)).
 *
 * The layout provides the `synkos:set-nav-title` inject token so
 * `AppPageLargeTitle` can crossfade collapsed titles into the nav bar.
 *
 * @example
 * import { MainLayout, setupSynkosRouter } from '@synkos/client'
 *
 * createRouter({
 *   routes: [
 *     {
 *       path: '/',
 *       component: MainLayout,
 *       children: [
 *         { path: '', meta: { tab: { icon: 'home', labelKey: 'tabs.home' } }, component: HomePage },
 *         ...
 *       ],
 *     },
 *   ],
 * })
 */
import { computed, isRef, onMounted, onUnmounted, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import DeletionBanner from '../../vue/components/navigation/DeletionBanner.vue';
import AppMenuDrawer from '../../vue/components/navigation/AppMenuDrawer.vue';
import { AppIcon } from '@synkos/ui';
import { getClientConfig } from '../../internal/app-config.js';
import { getTabConfig } from '../internal/tab-config.js';
import {
  getTabStackTop,
  popTabStack,
  isTabStacksEnabled,
} from '../internal/tab-stacks.js';
import { useEdgeSwipeBack } from '../composables/useEdgeSwipeBack.js';
import {
  navTrailingAction,
  navTitleOverride,
  setNavTitle,
  tabTransitionName,
} from '../internal/nav-state.js';

const appConfig = getClientConfig();

// Provide the nav title setter so AppPageLargeTitle (in @synkos/ui) can inject it
// without creating a circular package dependency.
provide('synkos:set-nav-title', (title: string | null) => setNavTitle(title));

// Counter incremented every time the user re-taps the active tab. AppPage
// watches it and scrolls its container to the top — the iOS UITabBar gesture.
// Provided via inject (not a singleton) so each MainLayout instance owns its
// own signal — supports multiple shells in the same app (e.g. modals).
const scrollToTopSignal = ref(0);
provide('synkos:scroll-to-top-signal', scrollToTopSignal);

// iOS scroll-edge appearance: nav bar is transparent while the active page
// is at the top of its scroll, glass once content has scrolled. AppPage
// reports its scroll state through this setter.
const scrolledFromTop = ref(false);
provide('synkos:set-scrolled-from-top', (scrolled: boolean) => {
  scrolledFromTop.value = scrolled;
});

// iOS native: when the keyboard appears the tab bar slides off-screen so the
// active input is never occluded. We mirror that with a CSS class. Listeners
// are attached on mount via dynamic import so apps without
// `@capacitor/keyboard` installed see no behaviour change.
const keyboardOpen = ref(false);
type KeyboardListener = { remove: () => void } | { remove: () => Promise<void> };
let keyboardListeners: KeyboardListener[] = [];

onMounted(async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const { Keyboard } = await import('@capacitor/keyboard');
    keyboardListeners = await Promise.all([
      Keyboard.addListener('keyboardWillShow', () => {
        keyboardOpen.value = true;
      }),
      Keyboard.addListener('keyboardWillHide', () => {
        keyboardOpen.value = false;
      }),
    ]);
  } catch {
    // Plugin not installed — keep tab bar visible during keyboard.
  }
});

onUnmounted(() => {
  for (const l of keyboardListeners) void l.remove();
  keyboardListeners = [];
});

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

const showMenu = ref(false);

// ── Route helpers ──────────────────────────────────────────────────
const isSubRoute = computed(() => tabs.value.every((tab) => tab.path !== route.path));

// iOS edge-swipe-back: only armed on sub-routes (where there's something to
// pop back to). Tab-root pages absorb the gesture so swipes don't accidentally
// throw the user out of the shell. Calls into goBack() so the swipe and the
// nav-bar back button share the same stack-aware behaviour.
const edgeSwipe = useEdgeSwipeBack({
  enabled: () => isSubRoute.value,
  onSwipe: () => goBack(),
});

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
// Direction of the route swap (slide-left / slide-right / fade / push) is
// decided by `router.afterEach` in `setupSynkosRouter`, comparing tab
// indices of `from` vs `to`. That makes the animation correct for every
// navigation source: tab tap, back gesture, programmatic push, deep link,
// browser back. Three things happen on tap of `path`:
//
// 1. Inactive tab → push to either the tab root, or — when
//    `stackNavigation: true` — the top of that tab's navigation stack
//    (UITabBarController behaviour).
// 2. Active tab AND we're at its root → emit scroll-to-top (UITabBar gesture).
// 3. Active tab AND we're inside a sub-route of it → pop to the tab root.
function navigate(path: string) {
  const targetTab = tabs.value.find((t) => t.path === path);
  if (!targetTab) return;

  void Haptics.impact({ style: ImpactStyle.Light });

  if (isTabActive(targetTab)) {
    if (route.path === path) {
      // Already at root → scroll to top.
      scrollToTopSignal.value++;
    } else {
      // Inside a sub-route of this tab → pop to root.
      void router.push(path);
    }
    return;
  }

  // Switching to an inactive tab. Restore the top of its navigation stack
  // when stack navigation is enabled, otherwise just go to the tab root.
  const restored = getTabStackTop(path);
  void router.push(restored && restored !== path ? restored : path);
}

// Back-navigation: under stack mode, pop the active tab's stack and
// `router.replace()` to the new top so the global Vue Router history
// doesn't grow on each pop. Without stack mode, fall through to the
// classic `router.back()`.
function goBack() {
  void Haptics.impact({ style: ImpactStyle.Light });

  if (isTabStacksEnabled()) {
    const ownerTab = tabs.value.find((t) => isTabActive(t));
    if (ownerTab) {
      const newTop = popTabStack(ownerTab.path);
      if (newTop !== null) {
        void router.replace(newTop);
        return;
      }
    }
  }

  void router.back();
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
// iOS scroll-edge appearance: at the top of the active page, the nav bar
// has no fill and no border (`UINavigationBarAppearance.scrollEdgeAppearance`).
// Once the content scrolls, the bar gains its glass background and hairline
// border. We keep `backdrop-filter` always set so the GPU compositing layer
// is allocated once at mount instead of being re-promoted on first scroll;
// `transform: translateZ(0)` reinforces that promotion cross-engine.
.ios-nav-bar {
  flex-shrink: 0;
  padding-top: env(safe-area-inset-top, 0px);
  background: transparent;
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-bottom: 0.5px solid transparent;
  z-index: $z-raised;
  position: relative;
  transform: translateZ(0);
  transition:
    background 0.2s ease,
    border-bottom-color 0.2s ease;

  &.is-scrolled {
    background: var(--glass-bg, #{$glass-bg});
    border-bottom-color: var(--glass-border, #{$glass-border});
  }
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

// ─── Transition wrapper ───────────────────────────────────────────
// Pure container: clips the absolute-positioned page roots during the
// route transition. Scroll is owned by `AppPage` so each tab keeps its own
// scroll position across keep-alive cycles.
.slide-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

// ─── Tab Bar ──────────────────────────────────────────────────────
// See `.ios-nav-bar` for why `translateZ(0)` is set. When the on-screen
// keyboard is open the bar slides off-screen so it never sits visually
// behind the keyboard surface — matches UITabBar's native behaviour.
.ios-tab-bar {
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: var(--glass-bg, #{$glass-bg});
  backdrop-filter: $glass-blur;
  -webkit-backdrop-filter: $glass-blur;
  border-top: 0.5px solid var(--glass-border, #{$glass-border});
  z-index: $z-raised;
  position: relative;
  transform: translateZ(0);
  transition:
    transform 0.25s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.2s ease;

  &.is-hidden-by-keyboard {
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
  }
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
// ─── Permanent GPU layer for the active page ──────────────────────
// `will-change: transform` was previously set on the .tab-slide-*-enter-active
// classes, meaning WebKit created the GPU compositing layer at the start of
// the animation. That promotion cost ~1 frame and showed up as the well-known
// "first tab change is jumpy" symptom. Setting it on the page root keeps the
// layer alive while the page is mounted and removes the cost from the
// animation's hot path.
.slide-wrapper > * {
  will-change: transform;
}

// ─── Tab + push transitions: shared base ──────────────────────────
// All transitions share the same absolute-fill positioning so the leaving
// and entering pages can overlap during the swap.
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active,
.tab-fade-enter-active,
.tab-fade-leave-active,
.nav-push-forward-enter-active,
.nav-push-forward-leave-active,
.nav-push-back-enter-active,
.nav-push-back-leave-active {
  position: absolute;
  inset: 0;
}

// ─── Slide push transitions (forward / back across tabs) ──────────
.tab-slide-left-enter-active,
.tab-slide-left-leave-active,
.tab-slide-right-enter-active,
.tab-slide-right-leave-active {
  transition: transform var(--platform-transition-push, 0.32s cubic-bezier(0.36, 0.66, 0.04, 1));
}

// ─── Sub-route push (UINavigationController) ──────────────────────
// Forward: enter slides in from the right, leaving page parallaxes 30% to
// the left. Back: mirror. The `cubic-bezier(0.32, 0.72, 0, 1)` curve is the
// reverse-engineered approximation of UIViewAnimationCurve's "ease out" that
// iOS uses for push/pop and is much closer to native than a generic ease-out.
.nav-push-forward-enter-active,
.nav-push-forward-leave-active,
.nav-push-back-enter-active,
.nav-push-back-leave-active {
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.nav-push-forward-enter-from {
  transform: translateX(100%);
}
.nav-push-forward-leave-to {
  transform: translateX(-30%);
}

.nav-push-back-enter-from {
  transform: translateX(-30%);
}
.nav-push-back-leave-to {
  transform: translateX(100%);
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

// ─── Crossfade (default for cold start, sub-routes, non-tab swaps) ─
// The default direction set by the router guard when one side isn't a tab
// or on the very first navigation. Mimics iOS UITabBar's instant cut more
// faithfully than a horizontal slide.
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.18s ease-out;
}
.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
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

// ─── Reduced motion ──────────────────────────────────────────────
// Users who opt into reduced motion get an instant cut instead of any of the
// transitions above. Keep a tiny non-zero duration so Vue still fires the
// after-leave / after-enter hooks.
@media (prefers-reduced-motion: reduce) {
  .tab-slide-left-enter-active,
  .tab-slide-left-leave-active,
  .tab-slide-right-enter-active,
  .tab-slide-right-leave-active,
  .tab-fade-enter-active,
  .tab-fade-leave-active,
  .nav-push-forward-enter-active,
  .nav-push-forward-leave-active,
  .nav-push-back-enter-active,
  .nav-push-back-leave-active,
  .nav-title-fade-enter-active,
  .nav-title-fade-leave-active {
    transition-duration: 0.01ms !important;
  }
  .slide-wrapper > * {
    will-change: auto;
  }
}
</style>
