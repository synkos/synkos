<script setup lang="ts">
const { t } = useI18n();
const config = useRuntimeConfig();

const navItems = computed(() => [
  { label: t('nav.docs'), to: '/docs/getting-started' },
  { label: t('nav.guide'), to: '/docs/guide/routing' },
  { label: t('nav.components'), to: '/docs/components' },
  { label: t('nav.api'), to: '/docs/api' },
  { label: t('nav.blog'), to: '/blog' },
]);

const githubUrl = computed(() => config.public.githubRepo);
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <div class="site-header__leading">
        <slot name="leading" />
        <SharedLogo />
      </div>

      <nav class="site-header__nav" :aria-label="$t('nav.primary')">
        <NuxtLinkLocale
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="site-header__link"
          active-class="site-header__link--active"
        >
          {{ item.label }}
        </NuxtLinkLocale>
      </nav>

      <div class="site-header__trailing">
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener"
          class="site-header__icon"
          aria-label="GitHub"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.04 11.04 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.55C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z"
            />
          </svg>
        </a>
        <SharedThemeToggle />
        <SharedLanguageSwitcher />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.site-header {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  height: $nav-height;
  background: var(--bg-overlay);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--border-subtle);
  z-index: $z-nav;

  &__inner {
    height: 100%;
    max-width: $container-max;
    margin: 0 auto;
    padding: 0 $space-6;
    display: flex;
    align-items: center;
    gap: $space-4;

    @media (min-width: $bp-lg) {
      padding: 0 $space-8;
    }
  }

  &__leading {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__nav {
    display: none;
    flex: 1;
    align-items: center;
    gap: $space-1;
    margin-inline-start: $space-6;

    @media (min-width: $bp-lg) {
      display: flex;
    }
  }

  &__link {
    padding: $space-2 $space-3;
    border-radius: $radius-sm;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: var(--text-secondary);
    transition: all $duration-fast $ease-out;

    &:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
    }

    &--active {
      color: var(--text-primary);
    }
  }

  &__trailing {
    margin-inline-start: auto;
    display: flex;
    align-items: center;
    gap: $space-1;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: $radius-sm;
    color: var(--text-secondary);
    transition: all $duration-fast $ease-out;

    &:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }
  }
}
</style>
