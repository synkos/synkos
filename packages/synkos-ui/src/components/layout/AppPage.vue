<template>
  <div ref="pageEl" class="app-page" @scroll.passive="onScroll">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * Page wrapper that fills its container with the active theme's background
 * and owns the page's vertical scroll. Each `AppPage` has its own scroll
 * position, so a tab cached via `<keep-alive>` keeps its scroll across
 * navigations — matching iOS `UITabBarController` behaviour.
 *
 * Use it as the root of your page components so they pick up the surface
 * color, full-height layout and per-page scroll consistently. When mounted
 * inside Synkos's `MainLayout`, re-tapping the active tab triggers a smooth
 * scroll-to-top via an injected signal.
 *
 * @example
 * <template>
 *   <AppPage>
 *     <AppPageLargeTitle title="Inbox" />
 *     <!-- page content -->
 *   </AppPage>
 * </template>
 */
import { inject, onMounted, onUnmounted, ref, watch, type Ref } from 'vue';

defineSlots<{
  /** Page content. */
  default: () => unknown;
}>();

const pageEl = ref<HTMLElement | null>(null);

// Injected by MainLayout — incremented on every re-tap of the active tab so
// AppPage can scroll to top. Falls back to a no-op outside Synkos's layout.
const scrollSignal = inject<Ref<number> | null>('synkos:scroll-to-top-signal', null);

if (scrollSignal) {
  watch(scrollSignal, () => {
    if (!pageEl.value) return;
    // Smooth scroll only if the user actually has somewhere to go up to.
    if (pageEl.value.scrollTop > 0) {
      pageEl.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

// Injected by MainLayout — flips the nav bar between transparent (top of
// scroll) and glass (scrolled). No-op outside Synkos's layout. Reading the
// position is a passive listener so it stays cheap.
const setScrolledFromTop = inject<(scrolled: boolean) => void>(
  'synkos:set-scrolled-from-top',
  () => {}
);

let lastScrolled: boolean | null = null;
function onScroll() {
  if (!pageEl.value) return;
  const scrolled = pageEl.value.scrollTop > 0;
  if (scrolled === lastScrolled) return;
  lastScrolled = scrolled;
  setScrolledFromTop(scrolled);
}

onMounted(() => {
  // Initial state — covers cached pages re-activated by keep-alive.
  if (pageEl.value) onScroll();
});

onUnmounted(() => {
  // Don't leave the nav bar stuck in `is-scrolled` if the page that put it
  // there is gone before the new page reports its own state.
  setScrolledFromTop(false);
});
</script>

<style lang="scss" scoped>
// AppPage is the scroll container. Each page (cached via keep-alive) keeps
// its own scroll position, matching iOS UITabBarController behaviour where
// every tab has its own UINavigationController stack with its own scroll
// view. Previously the scroll lived on .slide-wrapper inside MainLayout,
// which made scroll position leak across tabs.
.app-page {
  height: 100%;
  background: var(--surface-bg, #000000);
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
</style>
