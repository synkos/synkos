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
/**
 * Renders an icon from the synkos-ui icon registry as inline SVG. Color is
 * controlled via the parent's CSS `color` property (the icon uses
 * `currentColor`); pass color through `style` or a parent class instead of
 * the `color` prop.
 *
 * @example
 * <AppIcon name="chevron_right" size="20px" />
 * <AppIcon name="bell" style="color: var(--color-primary)" />
 */
import { computed } from 'vue';
import { getIcon } from '../../icons/index.js';

const props = withDefaults(
  defineProps<{
    /** Icon name. See the icon registry for the full list. */
    name: string;
    /** CSS size, applied to both width and height. */
    size?: string;
    /** Currently unused — control color via `currentColor` from a parent. */
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
