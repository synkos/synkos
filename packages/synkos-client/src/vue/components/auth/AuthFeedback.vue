<template>
  <div class="auth-feedback">
    <div v-if="loading" class="auth-feedback__spinner">
      <AppSpinner size="18px" color="white" />
    </div>
    <div v-else-if="success" class="auth-feedback__success">
      <AppIcon name="check_circle_outline" size="16px" />
      {{ success }}
    </div>
    <div v-else-if="fieldError" class="auth-feedback__field-error">
      {{ fieldError }}
    </div>
    <div v-else-if="globalError" class="auth-feedback__global-error">
      <AppIcon name="error_outline" size="16px" />
      {{ globalError }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Feedback strip used in auth forms — renders one of four states based on
 * which prop is set. Designed for the single-line space below a field group:
 *
 * 1. `loading` → spinner
 * 2. `success` → success message with check icon
 * 3. `fieldError` → small inline error
 * 4. `globalError` → highlighted error card with icon
 *
 * Reserve the height even when empty (the component keeps a minimum size) so
 * the form doesn't jump as state changes.
 *
 * @example
 * <AuthFeedback
 *   :loading="submitting"
 *   :field-error="errors.email"
 *   :global-error="errors.global"
 *   :success="successMessage"
 * />
 */
import { AppIcon, AppSpinner } from '@synkos/ui';

defineProps<{
  /** Show the spinner state. Takes priority over the other states. */
  loading?: boolean;
  /** Inline error text (typically next to a single field). */
  fieldError?: string;
  /** Highlighted error card spanning the form. */
  globalError?: string;
  /** Success confirmation message. */
  success?: string;
}>();
</script>

<style lang="scss" scoped>
.auth-feedback {
  min-height: 44px;
  display: flex;
  align-items: center;
}

.auth-feedback__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.auth-feedback__success {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: $font-body-sm;
  color: var(--color-positive);
  letter-spacing: -0.1px;
}

.auth-feedback__field-error {
  font-size: $font-body-sm;
  color: var(--color-negative);
  padding-left: $space-2;
  letter-spacing: -0.1px;
}

.auth-feedback__global-error {
  display: flex;
  align-items: center;
  gap: $space-3;
  background: rgba(255, 69, 58, 0.12);
  border: 0.5px solid rgba(255, 69, 58, 0.25);
  border-radius: $radius-md;
  padding: $space-5 $space-7;
  font-size: $font-body-sm;
  color: var(--color-negative);
  letter-spacing: -0.1px;
  width: 100%;
}
</style>
