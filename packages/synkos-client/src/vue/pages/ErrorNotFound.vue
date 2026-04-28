<template>
  <div class="not-found">
    <AppIcon name="search_off" size="64px" style="color: rgba(255, 255, 255, 0.4)" />
    <p class="not-found-text">404 — Page not found</p>
    <router-link :to="{ name: 'home' }" class="not-found-btn">Go home</router-link>
  </div>
</template>

<script setup lang="ts">
import { AppIcon } from '@synkos/ui';
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: 16px;
  background: var(--surface-bg, #000);
}

.not-found-text {
  font-size: $font-body;
  color: var(--text-muted, rgba(255, 255, 255, 0.5));
  margin: 0;
}

.not-found-btn {
  padding: 10px 24px;
  border-radius: $radius-xl;
  background: var(--color-primary, #{$primary});
  color: #fff;
  font-size: $font-body;
  font-weight: 600;
  text-decoration: none;

  &:active {
    opacity: 0.85;
  }
}
</style>
