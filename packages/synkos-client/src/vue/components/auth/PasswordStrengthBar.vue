<template>
  <div v-if="level" class="strength-bar-wrap">
    <div class="strength-bar">
      <div class="strength-fill" :class="`strength-fill--${level}`" :style="{ width: pct + '%' }" />
    </div>
    <slot :level="level" :pct="pct">
      <span class="strength-label" :class="`strength-label--${level}`">
        {{ label }}
      </span>
    </slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Visual feedback for password strength — a colored bar plus a textual label.
 * Drive it from the `usePasswordStrength()` composable, which evaluates the
 * password and exposes both the level and the percentage you pass in here.
 *
 * @example
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { PasswordStrengthBar, usePasswordStrength } from '@synkos/client'
 *
 * const password = ref('')
 * const strength = usePasswordStrength(password)
 * <\/script>
 *
 * <template>
 *   <input v-model="password" type="password" />
 *   <PasswordStrengthBar :level="strength.level" :pct="strength.pct" />
 * </template>
 */
import { computed } from 'vue';

/** Strength buckets returned by `usePasswordStrength`. */
type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface Props {
  /** Strength level, or `null` while no password has been entered. */
  level: StrengthLevel | null;
  /** Width of the colored bar as a percentage (0-100). */
  pct: number;
  /** Override the default labels per level (i18n). */
  labels?: Record<StrengthLevel, string>;
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => ({ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }),
});

const label = computed(() => (props.level ? props.labels[props.level] : ''));

defineSlots<{
  /** Override the label rendering. Receives `{ level, pct }`. */
  default: (props: { level: StrengthLevel; pct: number }) => unknown;
}>();
</script>

<style lang="scss" scoped>
.strength-bar-wrap {
  display: flex;
  align-items: center;
  gap: $space-5;
}

.strength-bar {
  flex: 1;
  height: 3px;
  background: var(--auth-surface-2, #{$border-subtle});
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition:
    width 0.3s ease,
    background 0.3s ease;

  &--weak {
    background: var(--color-negative);
  }
  &--fair {
    background: var(--color-accent);
  }
  &--good,
  &--strong {
    background: var(--color-positive);
  }
}

.strength-label {
  font-size: $font-caption;
  font-weight: 500;
  letter-spacing: 0.1px;
  white-space: nowrap;

  &--weak {
    color: var(--color-negative);
  }
  &--fair {
    color: var(--color-accent);
  }
  &--good,
  &--strong {
    color: var(--color-positive);
  }
}
</style>
