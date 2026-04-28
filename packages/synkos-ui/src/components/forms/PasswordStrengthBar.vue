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
import { computed } from 'vue';

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

interface Props {
  level: StrengthLevel | null;
  pct: number;
  labels?: Record<StrengthLevel, string>;
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => ({ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }),
});

const label = computed(() => (props.level ? props.labels[props.level] : ''));
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
