<script setup lang="ts">
const { t } = useI18n();

async function copyInstall() {
  if (!import.meta.client) return;
  await navigator.clipboard.writeText('pnpm create synkos');
}
</script>

<template>
  <section class="hero">
    <div class="hero__glow" aria-hidden="true" />
    <div class="hero__inner container">
      <div class="hero__pill">
        <span class="hero__pill-dot" />
        <span>{{ t('landing.hero.tag') }}</span>
      </div>

      <h1 class="hero__title">
        {{ t('landing.hero.titleA') }}
        <span class="hero__title-grad">{{ t('landing.hero.titleB') }}</span>
      </h1>

      <p class="hero__subtitle">{{ t('landing.hero.subtitle') }}</p>

      <div class="hero__cta">
        <NuxtLinkLocale to="/docs/getting-started" class="hero__btn hero__btn--primary">
          {{ t('landing.hero.cta') }}
        </NuxtLinkLocale>
        <button class="hero__btn hero__btn--ghost" @click="copyInstall">
          <code>$ pnpm create synkos</code>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.hero {
  position: relative;
  padding: $space-20 0 $space-16;
  overflow: hidden;

  @media (min-width: $bp-lg) {
    padding: $space-32 0 $space-24;
  }

  &__glow {
    position: absolute;
    inset: 0;
    background: var(--gradient-hero);
    pointer-events: none;
    z-index: -1;
  }

  &__inner {
    text-align: center;
    max-width: 880px;
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: $space-1 $space-3;
    border: 1px solid var(--border-default);
    border-radius: $radius-full;
    background: var(--bg-elevated);
    color: var(--text-secondary);
    font-size: $text-xs;
    font-weight: $weight-medium;
    margin-bottom: $space-6;
  }

  &__pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-success);
    box-shadow: 0 0 8px var(--color-success);
  }

  &__title {
    font-size: clamp(#{$text-4xl}, 7vw, #{$text-7xl});
    line-height: $leading-tight;
    font-weight: $weight-bold;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    margin-bottom: $space-6;
  }

  &__title-grad {
    background: linear-gradient(120deg, var(--color-primary), var(--color-accent));
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }

  &__subtitle {
    font-size: clamp(#{$text-md}, 2.2vw, #{$text-xl});
    line-height: $leading-snug;
    color: var(--text-secondary);
    max-width: 640px;
    margin: 0 auto $space-10;
  }

  &__cta {
    display: flex;
    gap: $space-3;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
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
      box-shadow: var(--shadow-glow);

      &:hover {
        background: var(--color-primary-hover);
        color: var(--text-on-primary);
        transform: translateY(-1px);
      }
    }

    &--ghost {
      background: var(--bg-elevated);
      color: var(--text-secondary);
      border-color: var(--border-default);

      code {
        font-size: $text-sm;
        color: var(--text-primary);
      }

      &:hover {
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
    }
  }
}
</style>
