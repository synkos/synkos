<template>
  <div class="app-list-divider" :style="indent ? { marginLeft: `${indent}px` } : {}" />
</template>

<script setup lang="ts">
/**
 * A hairline separator drawn between list rows. Defaults to indenting past the
 * row icon — pass `indent="0"` for a full-width divider.
 *
 * @example
 * <AppListSection>
 *   <AppListRow icon="person" label="Profile" />
 *   <AppListDivider />
 *   <AppListRow icon="lock" label="Password" />
 * </AppListSection>
 */
defineProps<{
  /** Left margin in px. Use `0` for a full-width divider. */
  indent?: number;
}>();
</script>

<style lang="scss" scoped>
.app-list-divider {
  height: 0.5px;
  background: var(--separator, #{$separator});
  margin-left: $space-8;
}
</style>
