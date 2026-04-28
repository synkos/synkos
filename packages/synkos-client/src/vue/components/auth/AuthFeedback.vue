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
import { AppIcon, AppSpinner } from '@synkos/ui';

defineProps<{
  loading?: boolean;
  fieldError?: string;
  globalError?: string;
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
