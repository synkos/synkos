<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <section class="cta container">
    <div class="cta__card">
      <h2 class="cta__title">{{ t('landing.cta.title') }}</h2>
      <p class="cta__subtitle">{{ t('landing.cta.subtitle') }}</p>
      <div class="cta__actions">
        <NuxtLinkLocale to="/docs/getting-started" class="cta__btn cta__btn--primary">
          {{ t('landing.cta.start') }}
        </NuxtLinkLocale>
        <NuxtLinkLocale to="/docs/guide/routing" class="cta__btn cta__btn--ghost">
          {{ t('landing.cta.read') }}
        </NuxtLinkLocale>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.cta {
  padding: $space-16 $space-6 $space-24;

  &__card {
    text-align: center;
    max-width: 760px;
    margin: 0 auto;
    padding: $space-12 $space-8;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: $radius-2xl;
    background-image: radial-gradient(circle at 50% 0%, var(--color-primary-soft), transparent 60%);
  }

  &__title {
    font-size: clamp(#{$text-3xl}, 5vw, #{$text-4xl});
    line-height: $leading-tight;
    font-weight: $weight-bold;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__subtitle {
    color: var(--text-secondary);
    font-size: $text-md;
    margin-bottom: $space-8;
  }

  &__actions {
    display: flex;
    gap: $space-3;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 $space-6;
    border-radius: $radius-lg;
    font-size: $text-md;
    font-weight: $weight-semibold;
    transition: all $duration-fast $ease-out;
    border: 1px solid transparent;

    &--primary {
      background: var(--color-primary);
      color: var(--text-on-primary);

      &:hover {
        background: var(--color-primary-hover);
        color: var(--text-on-primary);
        transform: translateY(-1px);
      }
    }

    &--ghost {
      background: transparent;
      color: var(--text-primary);
      border-color: var(--border-default);

      &:hover {
        background: var(--bg-canvas);
        border-color: var(--border-strong);
      }
    }
  }
}
</style>
