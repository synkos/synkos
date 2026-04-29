<script setup lang="ts">
// Docs layout — sidebar + content + TOC
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<template>
  <div class="docs-layout">
    <SharedHeader>
      <template #leading>
        <button class="docs-layout__menu" aria-label="Toggle sidebar" @click="toggleSidebar">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </template>
    </SharedHeader>

    <div class="docs-layout__body">
      <DocsSidebar :open="sidebarOpen" class="docs-layout__sidebar" @navigate="closeSidebar" />

      <main class="docs-layout__content">
        <slot />
      </main>
    </div>

    <div v-if="sidebarOpen" class="docs-layout__scrim" aria-hidden="true" @click="closeSidebar" />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.docs-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: $radius-sm;
    color: var(--text-secondary);

    &:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }

    @media (min-width: $bp-lg) {
      display: none;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    padding-top: $nav-height;
    max-width: $container-max;
    width: 100%;
    margin: 0 auto;
  }

  &__sidebar {
    position: fixed;
    inset-block-start: $nav-height;
    inset-inline-start: 0;
    width: $sidebar-width;
    height: calc(100vh - #{$nav-height});
    overflow-y: auto;
    border-inline-end: 1px solid var(--border-subtle);
    background: var(--bg-canvas);
    transform: translateX(-100%);
    transition: transform $duration-base $ease-out;
    z-index: $z-sticky;

    &[data-open='true'] {
      transform: translateX(0);
    }

    @media (min-width: $bp-lg) {
      position: sticky;
      transform: none;
      flex-shrink: 0;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    padding: $space-8 $space-6;

    @media (min-width: $bp-lg) {
      margin-inline-start: 0;
      padding: $space-10 $space-12;
    }
  }

  &__scrim {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: calc(#{$z-sticky} - 1);
    backdrop-filter: blur(4px);

    @media (min-width: $bp-lg) {
      display: none;
    }
  }
}
</style>
