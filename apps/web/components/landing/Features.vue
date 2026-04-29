<script setup lang="ts">
const { t } = useI18n();

const features = computed(() => [
  {
    icon: 'mobile',
    title: t('landing.features.mobile.title'),
    description: t('landing.features.mobile.desc'),
  },
  {
    icon: 'auth',
    title: t('landing.features.auth.title'),
    description: t('landing.features.auth.desc'),
  },
  {
    icon: 'theme',
    title: t('landing.features.theme.title'),
    description: t('landing.features.theme.desc'),
  },
  {
    icon: 'i18n',
    title: t('landing.features.i18n.title'),
    description: t('landing.features.i18n.desc'),
  },
  {
    icon: 'native',
    title: t('landing.features.native.title'),
    description: t('landing.features.native.desc'),
  },
  {
    icon: 'dx',
    title: t('landing.features.dx.title'),
    description: t('landing.features.dx.desc'),
  },
]);
</script>

<template>
  <section class="features container">
    <header class="features__header">
      <h2 class="features__title">{{ t('landing.features.title') }}</h2>
      <p class="features__subtitle">{{ t('landing.features.subtitle') }}</p>
    </header>

    <div class="features__grid">
      <article v-for="feature in features" :key="feature.title" class="features__card">
        <div class="features__icon" :data-icon="feature.icon">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <template v-if="feature.icon === 'mobile'">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </template>
            <template v-else-if="feature.icon === 'auth'">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </template>
            <template v-else-if="feature.icon === 'theme'">
              <circle cx="12" cy="12" r="5" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </template>
            <template v-else-if="feature.icon === 'i18n'">
              <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
            </template>
            <template v-else-if="feature.icon === 'native'">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <polyline points="2 8.5 12 15 22 8.5" />
              <line x1="12" y1="22" x2="12" y2="15" />
            </template>
            <template v-else-if="feature.icon === 'dx'">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </template>
          </svg>
        </div>
        <h3 class="features__card-title">{{ feature.title }}</h3>
        <p class="features__card-desc">{{ feature.description }}</p>
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.features {
  padding: $space-20 $space-6;

  @media (min-width: $bp-lg) {
    padding: $space-24 $space-8;
  }

  &__header {
    text-align: center;
    max-width: 720px;
    margin: 0 auto $space-16;
  }

  &__title {
    font-size: clamp(#{$text-3xl}, 5vw, #{$text-5xl});
    line-height: $leading-tight;
    font-weight: $weight-bold;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin-bottom: $space-4;
  }

  &__subtitle {
    font-size: $text-lg;
    color: var(--text-secondary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $space-5;
  }

  &__card {
    padding: $space-6;
    border: 1px solid var(--border-subtle);
    border-radius: $radius-lg;
    background: var(--bg-elevated);
    transition: all $duration-base $ease-out;

    &:hover {
      border-color: var(--border-default);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: $radius-md;
    background: var(--color-primary-soft);
    color: var(--color-primary);
    margin-bottom: $space-4;
  }

  &__card-title {
    font-size: $text-lg;
    font-weight: $weight-semibold;
    color: var(--text-primary);
    margin-bottom: $space-2;
  }

  &__card-desc {
    font-size: $text-sm;
    line-height: $leading-relaxed;
    color: var(--text-secondary);
  }
}
</style>
