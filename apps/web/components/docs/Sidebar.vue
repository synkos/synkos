<script setup lang="ts">
defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  navigate: [];
}>();

const { t } = useI18n();

interface NavLink {
  label: string;
  to: string;
}

interface NavSection {
  title: string;
  items: NavLink[];
}

const sections = computed<NavSection[]>(() => [
  {
    title: t('docs.nav.intro'),
    items: [
      { label: t('docs.nav.gettingStarted'), to: '/docs/getting-started' },
      { label: t('docs.nav.philosophy'), to: '/docs/philosophy' },
    ],
  },
  {
    title: t('docs.nav.guide'),
    items: [
      { label: t('docs.nav.routing'), to: '/docs/guide/routing' },
      { label: t('docs.nav.auth'), to: '/docs/guide/auth' },
      { label: t('docs.nav.theming'), to: '/docs/guide/theming' },
      { label: t('docs.nav.i18n'), to: '/docs/guide/i18n' },
      { label: t('docs.nav.capacitor'), to: '/docs/guide/capacitor' },
      { label: t('docs.nav.deployment'), to: '/docs/guide/deployment' },
    ],
  },
  {
    title: t('docs.nav.components'),
    items: [{ label: t('docs.nav.componentsOverview'), to: '/docs/components' }],
  },
  {
    title: t('docs.nav.api'),
    items: [
      { label: t('docs.nav.apiOverview'), to: '/docs/api' },
      { label: t('docs.nav.composables'), to: '/docs/api/composables' },
      { label: t('docs.nav.stores'), to: '/docs/api/stores' },
      { label: t('docs.nav.services'), to: '/docs/api/services' },
      { label: t('docs.nav.router'), to: '/docs/api/router' },
      { label: t('docs.nav.boot'), to: '/docs/api/boot' },
      { label: t('docs.nav.types'), to: '/docs/api/types' },
    ],
  },
]);
</script>

<template>
  <aside class="docs-sidebar" :data-open="open">
    <nav class="docs-sidebar__nav" :aria-label="$t('docs.nav.label')">
      <div v-for="section in sections" :key="section.title" class="docs-sidebar__section">
        <h4 class="docs-sidebar__heading">{{ section.title }}</h4>
        <ul class="docs-sidebar__list">
          <li v-for="item in section.items" :key="item.to">
            <NuxtLinkLocale
              :to="item.to"
              class="docs-sidebar__link"
              active-class="docs-sidebar__link--active"
              @click="emit('navigate')"
            >
              {{ item.label }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.docs-sidebar {
  &__nav {
    padding: $space-6 $space-5;
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__heading {
    font-size: $text-xs;
    font-weight: $weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    padding: 0 $space-3;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__link {
    display: block;
    padding: $space-2 $space-3;
    border-radius: $radius-sm;
    font-size: $text-sm;
    color: var(--text-secondary);
    transition: all $duration-fast $ease-out;

    &:hover {
      color: var(--text-primary);
      background: var(--bg-elevated);
    }

    &--active {
      color: var(--color-primary);
      background: var(--color-primary-soft);
      font-weight: $weight-medium;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
</style>
