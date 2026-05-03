<template>
  <span
    class="ios-spinner"
    role="status"
    aria-label="Loading"
    :style="{ width: size, height: size, color: resolvedColor }"
  >
    <span
      v-for="i in 12"
      :key="i"
      class="ios-spinner__bar"
      :style="{
        transform: `rotate(${(i - 1) * 30}deg)`,
        animationDelay: `${-(i - 1) / 12}s`,
      }"
    />
  </span>
</template>

<script setup lang="ts">
/**
 * Native-style iOS activity indicator (the 12-bar `UIActivityIndicatorView`
 * rendition). Use anywhere you would otherwise reach for a generic spinner —
 * it visually matches the rest of the iOS chrome and looks at home both
 * inline (next to text) and at page level.
 *
 * @example
 * <IOSSpinner />                         // 20px, currentColor
 * <IOSSpinner size="32px" color="primary" />
 * <IOSSpinner color="#ff0099" />
 */
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
  current: 'currentColor',
};

const props = withDefaults(
  defineProps<{
    /** CSS size of the spinner box (e.g. `"20px"`, `"2rem"`). */
    size?: string;
    /**
     * Bar color: a framework name (`primary`, `negative`, …), `current` to
     * inherit `color` from the parent, or any CSS color string.
     */
    color?: string;
  }>(),
  { size: '20px', color: 'current' }
);

const resolvedColor = computed<string>(() => COLOR_MAP[props.color] ?? props.color);
</script>

<style lang="scss" scoped>
@keyframes ios-spinner-fade {
  0% {
    opacity: 1;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0.22;
  }
}

.ios-spinner {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

// Twelve thin pills laid radially around the center. Each bar uses the
// container's `currentColor`, so colour propagates by setting `color` on the
// parent. Animation: a 1 s linear fade ripple, with the bright spot rotating
// clockwise via staggered negative `animation-delay`s.
.ios-spinner__bar {
  position: absolute;
  top: 0;
  left: 50%;
  width: 9%;
  height: 28%;
  margin-left: -4.5%;
  background-color: currentColor;
  border-radius: 999px;
  // Origin = horizontal center of bar, 178.57% down — that lands exactly on
  // the spinner's center because the bar height is 28% of the spinner.
  transform-origin: 50% 178.57%;
  animation: ios-spinner-fade 1s linear infinite;
  // `backwards` so the first frame is shown immediately (avoids a "blank"
  // flash on slower WebKit when the negative delay is large).
  animation-fill-mode: backwards;
}
</style>
