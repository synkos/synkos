<script setup lang="ts">
// Default layout — landing, blog, marketing pages
</script>

<template>
  <div class="default-layout">
    <SharedHeader />
    <main class="default-layout__main">
      <slot />
    </main>
    <SharedFooter />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1;
    padding-top: $nav-height;
  }
}
</style>
