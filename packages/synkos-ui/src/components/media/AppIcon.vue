<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    v-html="content"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getIcon } from '../../icons/index.js';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: string;
    color?: string;
  }>(),
  {
    size: '24px',
  }
);

const content = computed(() => getIcon(props.name));
</script>

<style lang="scss" scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  fill: currentColor;
  vertical-align: middle;
  // Color is controlled by CSS `color` property via currentColor.
  // Pass `color` via style or a parent class — not via this component.
}
</style>
