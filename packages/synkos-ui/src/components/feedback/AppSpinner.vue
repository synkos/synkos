<template>
  <span
    class="app-spinner"
    role="status"
    aria-label="Loading"
    :style="{ width: size, height: size, borderTopColor: resolvedColor }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const COLOR_MAP: Record<string, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  positive: 'var(--color-positive)',
  negative: 'var(--color-negative)',
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  white: '#ffffff',
  black: '#000000',
};

const props = withDefaults(
  defineProps<{
    size?: string;
    color?: string;
  }>(),
  {
    size: '24px',
    color: 'white',
  }
);

const resolvedColor = computed(() => COLOR_MAP[props.color] ?? props.color);
</script>

<style lang="scss" scoped>
@keyframes app-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-spinner {
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  animation: app-spinner-spin 0.7s linear infinite;
  vertical-align: middle;
}
</style>
