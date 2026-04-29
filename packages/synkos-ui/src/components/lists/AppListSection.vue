<template>
  <div class="app-list-section">
    <p v-if="title" class="section-header">{{ title }}</p>
    <div class="list-group">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Wraps a group of `AppListRow` (or any content) inside a card with rounded
 * corners and an optional uppercase section header above it. The standard way
 * to lay out settings pages.
 *
 * @example
 * <AppListSection title="Notifications">
 *   <AppListRow icon="bell" label="Push" @click="..." />
 *   <AppListRow icon="mail" label="Email" @click="..." />
 * </AppListSection>
 */
defineProps<{
  /** Uppercase header rendered above the card. Optional. */
  title?: string;
}>();

defineSlots<{
  /** Section content — typically `AppListRow` instances. */
  default: () => unknown;
}>();
</script>

<style lang="scss" scoped>
.app-list-section {
  padding: 0 $space-8 $space-2;
}

.section-header {
  font-size: $font-caption;
  font-weight: 600;
  color: var(--text-label, #{$text-label});
  letter-spacing: $ls-label;
  text-transform: uppercase;
  padding: $space-8 $space-2 $space-3;
  margin: 0;
}

.list-group {
  background: var(--surface-2, #{$surface-2});
  border: 0.5px solid var(--surface-2-border, #{$surface-2-border});
  border-radius: $radius-xl;
  overflow: hidden;
}
</style>
