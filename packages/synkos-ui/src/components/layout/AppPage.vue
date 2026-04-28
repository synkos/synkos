<template>
  <div class="app-page">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Drop-in replacement for q-page.
// Fills its container and applies the themed page background.
</script>

<style lang="scss" scoped>
.app-page {
  min-height: 100%;
  background: var(--surface-bg, #000000);
  box-sizing: border-box;
}
</style>
