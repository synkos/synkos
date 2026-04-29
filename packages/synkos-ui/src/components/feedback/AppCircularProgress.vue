<template>
  <svg
    class="app-circular-progress"
    :class="{ 'app-circular-progress--spin': indeterminate }"
    :width="size"
    :height="size"
    :viewBox="`0 0 ${D} ${D}`"
    aria-hidden="true"
  >
    <circle
      v-if="trackColor !== 'transparent'"
      class="track"
      :cx="C"
      :cy="C"
      :r="R"
      :stroke="resolvedTrack"
      fill="none"
      :stroke-width="SW"
    />
    <circle
      class="indicator"
      :cx="C"
      :cy="C"
      :r="R"
      :stroke="resolvedColor"
      fill="none"
      :stroke-width="SW"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="indeterminate ? circumference * 0.25 : offset"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * Circular progress indicator. Two modes:
 *
 * - **Determinate** — pass `value` (0-100). The arc grows as work progresses.
 * - **Indeterminate** — set `indeterminate` to true. The arc spins continuously.
 *
 * @example
 * <!-- Determinate progress for an upload -->
 * <AppCircularProgress :value="uploadPct" size="32px" />
 *
 * <!-- Indeterminate while waiting for a server response -->
 * <AppCircularProgress indeterminate color="primary" track-color="rgba(255,255,255,0.1)" />
 */
import { computed } from 'vue';

const COLOR_MAP: Record<string, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  white: '#ffffff',
  black: '#000000',
};

const props = withDefaults(
  defineProps<{
    /** CSS size (e.g. `"24px"`, `"2rem"`). */
    size?: string;
    /** Indicator color. Framework name or any CSS color. */
    color?: string;
    /** Track (background ring) color. `"transparent"` hides the track. */
    trackColor?: string;
    /** Progress value 0-100. Ignored when `indeterminate` is true. */
    value?: number;
    /** Spin continuously instead of using `value`. */
    indeterminate?: boolean;
  }>(),
  {
    size: '24px',
    color: 'primary',
    trackColor: 'transparent',
    value: 0,
    indeterminate: false,
  }
);

const D = 44;
const C = D / 2;
const SW = 4;
const R = (D - SW) / 2;

const circumference = computed(() => 2 * Math.PI * R);
const offset = computed(() => circumference.value * (1 - props.value / 100));
const resolvedColor = computed(() => COLOR_MAP[props.color ?? ''] ?? props.color);
const resolvedTrack = computed(() => COLOR_MAP[props.trackColor ?? ''] ?? props.trackColor);
</script>

<style lang="scss" scoped>
@keyframes app-circular-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-circular-progress {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transform-origin: center;

  .indicator {
    transition: stroke-dashoffset 0.3s ease;
  }

  &--spin {
    animation: app-circular-spin 1s linear infinite;
  }
}
</style>
