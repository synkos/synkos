<script setup lang="ts">
/**
 * Card wrapper that groups consecutive `AuthFieldRow` instances and draws
 * hairlines between them. The visual base of every form on `LoginPage`,
 * `ChangePasswordPage`, and other auth screens.
 *
 * @example
 * <AuthFieldGroup>
 *   <AuthFieldRow v-model="email" type="email" placeholder="Email" />
 *   <AuthFieldRow v-model="password" type="password" placeholder="Password" />
 * </AuthFieldGroup>
 */
defineSlots<{
  /** Field rows. Typically `AuthFieldRow` instances. */
  default: () => unknown;
}>();
</script>

<template>
  <div class="auth-field-group">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.auth-field-group {
  background: var(--auth-surface-1);
  border: 0.5px solid var(--auth-border);
  border-radius: $radius-xl;
  overflow: hidden;

  :deep(.auth-field-row + .auth-field-row) {
    border-top: 0.5px solid var(--auth-border);
  }
}
</style>
