<template>
  <div class="app-page-large-title">
    <div class="title-row">
      <h1 class="large-title">{{ title }}</h1>
      <slot name="right" />
    </div>
    <p v-if="subtitle" class="large-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<style lang="scss" scoped>
.app-page-large-title {
  padding: $space-10 $space-10 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.large-title {
  font-size: $font-display;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: $ls-tight;
  margin: 0;
  line-height: $lh-tight;
}

.large-subtitle {
  font-size: $font-body;
  color: $text-label;
  line-height: $lh-relaxed;
  margin: $space-4 0 0;
  white-space: pre-line;
}
</style>
