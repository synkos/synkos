<template>
  <div class="app-page">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * Page wrapper that fills its container with the active theme's background.
 * Use it as the root of your page components so they pick up the surface
 * color and full-height layout consistently.
 *
 * @example
 * <template>
 *   <AppPage>
 *     <AppPageLargeTitle title="Inbox" />
 *     <!-- page content -->
 *   </AppPage>
 * </template>
 */

defineSlots<{
  /** Page content. */
  default: () => unknown;
}>();
</script>

<style lang="scss" scoped>
.app-page {
  min-height: 100%;
  background: var(--surface-bg, #000000);
  box-sizing: border-box;
}
</style>
