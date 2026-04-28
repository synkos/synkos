<template>
  <div class="app-list-divider" :style="indent ? { marginLeft: `${indent}px` } : {}" />
</template>

<script setup lang="ts">
defineProps<{
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
