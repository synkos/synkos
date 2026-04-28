<template>
  <div class="not-found">
    <div class="not-found__inner">
      <AppIcon name="search_off" size="64px" style="color: rgba(255, 255, 255, 0.6)" />
      <div class="not-found__code">404</div>
      <p class="not-found__msg">Oops. Nothing here...</p>
      <router-link to="/" class="not-found__btn">Go Home</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppIcon } from '@synkos/ui';
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: var(--color-primary, #007aff);
  text-align: center;
  padding: 24px;

  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  &__code {
    font-size: min(30vw, 140px);
    font-weight: 700;
    color: #fff;
    opacity: 0.9;
    line-height: 1;
  }

  &__msg {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  &__btn {
    display: inline-block;
    margin-top: 8px;
    padding: 12px 28px;
    background: #fff;
    color: var(--color-primary, #007aff);
    border-radius: 14px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;

    &:active {
      opacity: 0.85;
    }
  }
}
</style>
