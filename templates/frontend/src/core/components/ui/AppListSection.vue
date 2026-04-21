<template>
  <div class="app-list-section">
    <p v-if="title" class="section-header">{{ title }}</p>
    <div class="list-group">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<style lang="scss" scoped>
.app-list-section {
  padding: 0 $space-8 $space-2;
}

.section-header {
  font-size: $font-caption;
  font-weight: 600;
  color: $text-label;
  letter-spacing: $ls-label;
  text-transform: uppercase;
  padding: $space-8 $space-2 $space-3;
  margin: 0;
}

.list-group {
  background: $surface-2;
  border: 0.5px solid $surface-2-border;
  border-radius: $radius-xl;
  overflow: hidden;
}
</style>
