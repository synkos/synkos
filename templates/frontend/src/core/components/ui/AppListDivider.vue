<template>
  <div class="app-list-divider" :style="indent ? { marginLeft: `${indent}px` } : {}" />
</template>

<script setup lang="ts">
defineProps<{
  // Left indent in px. Default 16 (no icon). Use 60 when rows have icons.
  indent?: number;
}>();
</script>

<style lang="scss" scoped>
.app-list-divider {
  height: 0.5px;
  background: $separator;
  margin-left: $space-8;
}
</style>
