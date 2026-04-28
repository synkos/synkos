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
