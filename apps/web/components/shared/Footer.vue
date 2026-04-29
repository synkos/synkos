<script setup lang="ts">
const { t } = useI18n();
const config = useRuntimeConfig();

const sections = computed(() => [
  {
    title: t('footer.docs'),
    links: [
      { label: t('nav.gettingStarted'), to: '/docs/getting-started' },
      { label: t('nav.guide'), to: '/docs/guide/routing' },
      { label: t('nav.components'), to: '/docs/components' },
      { label: t('nav.api'), to: '/docs/api' },
    ],
  },
  {
    title: t('footer.community'),
    links: [{ label: 'GitHub', href: config.public.githubRepo, external: true }],
  },
  {
    title: t('footer.resources'),
    links: [{ label: t('nav.blog'), to: '/blog' }],
  },
]);

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <SharedLogo />
        <p class="site-footer__tagline">{{ t('footer.tagline') }}</p>
      </div>

      <div class="site-footer__columns">
        <div v-for="section in sections" :key="section.title" class="site-footer__column">
          <h4 class="site-footer__heading">{{ section.title }}</h4>
          <ul class="site-footer__list">
            <li v-for="link in section.links" :key="link.label">
              <a
                v-if="'href' in link && link.href"
                :href="link.href"
                target="_blank"
                rel="noopener"
                class="site-footer__link"
              >
                {{ link.label }}
              </a>
              <NuxtLinkLocale
                v-else-if="'to' in link && link.to"
                :to="link.to"
                class="site-footer__link"
              >
                {{ link.label }}
              </NuxtLinkLocale>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="site-footer__bottom">
      <p>© {{ year }} Synkos. {{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.site-footer {
  border-top: 1px solid var(--border-subtle);
  padding: $space-16 $space-6 $space-6;
  background: var(--bg-canvas);

  @media (min-width: $bp-lg) {
    padding: $space-20 $space-8 $space-8;
  }

  &__inner {
    max-width: $container-max;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: $space-10;

    @media (min-width: $bp-md) {
      grid-template-columns: 1.4fr 2fr;
    }
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__tagline {
    color: var(--text-secondary);
    font-size: $text-sm;
    max-width: 320px;
  }

  &__columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: $space-8;
  }

  &__column {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__heading {
    font-size: $text-sm;
    font-weight: $weight-semibold;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__link {
    color: var(--text-secondary);
    font-size: $text-sm;

    &:hover {
      color: var(--text-primary);
    }
  }

  &__bottom {
    max-width: $container-max;
    margin: $space-12 auto 0;
    padding-top: $space-6;
    border-top: 1px solid var(--border-subtle);
    color: var(--text-tertiary);
    font-size: $text-sm;
  }
}
</style>
