<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{
  error: NuxtError;
}>();

const { t } = useI18n();
</script>

<template>
  <NuxtLayout>
    <section class="error container">
      <p class="error__code">{{ error.statusCode }}</p>
      <h1 class="error__title">
        {{ error.statusCode === 404 ? t('error.notFoundTitle') : t('error.genericTitle') }}
      </h1>
      <p class="error__message">
        {{ error.statusCode === 404 ? t('error.notFoundMessage') : error.message }}
      </p>
      <NuxtLinkLocale to="/" class="error__btn">{{ t('error.goHome') }}</NuxtLinkLocale>
    </section>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.error {
  text-align: center;
  padding: $space-32 $space-6;
  max-width: 560px;

  &__code {
    font-size: $text-6xl;
    font-weight: $weight-bold;
    color: var(--color-primary);
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: $space-3;
  }

  &__title {
    font-size: $text-3xl;
    font-weight: $weight-bold;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__message {
    color: var(--text-secondary);
    margin-bottom: $space-8;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    height: 44px;
    padding: 0 $space-6;
    border-radius: $radius-lg;
    background: var(--color-primary);
    color: var(--text-on-primary);
    font-weight: $weight-semibold;
    transition: background $duration-fast $ease-out;

    &:hover {
      background: var(--color-primary-hover);
      color: var(--text-on-primary);
    }
  }
}
</style>
