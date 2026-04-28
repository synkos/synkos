<template>
  <button class="app-btn" :class="`app-btn--${variant}`" :disabled="disabled || loading">
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'link';
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    loading: false,
    disabled: false,
  }
);
</script>

<style lang="scss" scoped>
.app-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: none;
  cursor: pointer;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  transition:
    opacity $transition-quick,
    transform 0.1s ease;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.app-btn--primary {
  height: 50px;
  background: var(--color-primary, #{$primary});
  color: #fff;
  border-radius: $radius-xl;
  font-size: $font-body-lg;
  font-weight: 600;
  letter-spacing: $ls-base;

  &:active:not(:disabled) {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

.app-btn--ghost {
  height: 44px;
  background: transparent;
  color: var(--text-label, #{$text-label});
  border-radius: $radius-xl;
  font-size: $font-body;
  font-weight: 500;

  &:active:not(:disabled) {
    opacity: 0.7;
  }
}

// ── Loading spinner ───────────────────────────────────────────────────────────
@keyframes app-btn-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-btn__spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  animation: app-btn-spin 0.7s linear infinite;
}

.app-btn--primary .app-btn__spinner {
  border-color: rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
}

.app-btn--ghost .app-btn__spinner,
.app-btn--link .app-btn__spinner {
  border-color: rgba(10, 132, 255, 0.25);
  border-top-color: var(--color-primary, #{$primary});
}

.app-btn--link {
  background: none;
  color: var(--color-primary, #{$primary});
  font-size: $font-body;
  font-weight: 500;
  padding: $space-4;
  letter-spacing: $ls-normal;

  &:active:not(:disabled) {
    opacity: 0.7;
  }
}
</style>
