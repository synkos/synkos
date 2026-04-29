<script setup lang="ts">
definePageMeta({
  layout: 'docs',
});

const route = useRoute();
const { locale, t } = useI18n();

// Compute the path inside the locale-scoped content collection.
// route.params.slug arrives as string[] when using catch-all.
const slug = computed(() => {
  const parts = route.params.slug;
  return Array.isArray(parts) ? parts.join('/') : (parts ?? '');
});

// Components and API pages are only generated in English. When the user is
// browsing the Spanish docs and hits one of those, transparently fall back
// to the English collection and show an "English only" notice.
const isApiOrComponents = computed(() => /^(components|api)(\/|$)/.test(slug.value));
const collection = computed<'en_docs' | 'es_docs'>(() => {
  if (locale.value === 'es' && !isApiOrComponents.value) return 'es_docs';
  return 'en_docs';
});
const englishOnlyFallback = computed(() => locale.value === 'es' && isApiOrComponents.value);
const contentPath = computed(() => {
  const lang = collection.value === 'es_docs' ? 'es' : 'en';
  return `/${lang}/docs/${slug.value || 'getting-started'}`;
});

const { data: page } = await useAsyncData(
  () => `${collection.value}:${contentPath.value}`,
  async () => {
    const result = await queryCollection(collection.value).path(contentPath.value).first();
    return result ?? null;
  },
  { default: () => null, watch: [contentPath, collection] }
);

const editPath = computed(() => `docs${contentPath.value}.md`);

useSeoMeta({
  title: () => (page.value?.title ? `${page.value.title} — Synkos` : 'Synkos Docs'),
  description: () => page.value?.description ?? '',
});
</script>

<template>
  <div class="docs-page">
    <article class="docs-page__article">
      <header v-if="page" class="docs-page__header">
        <h1 class="docs-page__title">{{ page.title }}</h1>
        <p v-if="page.description" class="docs-page__lede">{{ page.description }}</p>
      </header>

      <p v-if="englishOnlyFallback" class="docs-page__notice">
        {{ t('docs.englishOnly') }}
      </p>

      <ContentRenderer v-if="page" :value="page" class="prose" />

      <div v-else class="docs-page__missing">
        <p>{{ t('docs.notFound') }}</p>
      </div>

      <footer v-if="page" class="docs-page__footer">
        <DocsEditOnGitHub :path="editPath" />
      </footer>
    </article>

    <DocsTOC v-if="page?.body?.toc?.links" :links="page.body.toc.links" class="docs-page__toc" />
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.docs-page {
  display: flex;
  gap: $space-12;
  align-items: flex-start;

  &__article {
    flex: 1;
    min-width: 0;
    max-width: $content-max;
  }

  &__header {
    margin-bottom: $space-10;
    padding-bottom: $space-6;
    border-bottom: 1px solid var(--border-subtle);
  }

  &__title {
    font-size: $text-4xl;
    font-weight: $weight-bold;
    letter-spacing: -0.025em;
    line-height: $leading-tight;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__lede {
    font-size: $text-lg;
    color: var(--text-secondary);
    line-height: $leading-snug;
  }

  &__notice {
    margin-bottom: $space-8;
    padding: $space-3 $space-4;
    border-radius: $radius-md;
    border: 1px solid var(--color-primary-soft);
    background: var(--color-primary-soft);
    color: var(--text-secondary);
    font-size: $text-sm;
  }

  &__missing {
    color: var(--text-secondary);
    padding: $space-12 0;
  }

  &__footer {
    margin-top: $space-12;
    padding-top: $space-6;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: flex-end;
  }

  &__toc {
    display: none;
    @media (min-width: $bp-xl) {
      display: block;
      flex-shrink: 0;
    }
  }
}

// Markdown content styles (deep selectors so they apply to ContentRenderer output)
:deep(.prose) {
  color: var(--text-primary);
  line-height: $leading-relaxed;

  h2,
  h3,
  h4 {
    font-weight: $weight-semibold;
    letter-spacing: -0.01em;
    line-height: $leading-snug;
    color: var(--text-primary);
    scroll-margin-top: calc(#{$nav-height} + #{$space-4});
  }

  h2 {
    font-size: $text-2xl;
    margin-top: $space-12;
    margin-bottom: $space-4;
  }

  h3 {
    font-size: $text-xl;
    margin-top: $space-8;
    margin-bottom: $space-3;
  }

  h4 {
    font-size: $text-lg;
    margin-top: $space-6;
    margin-bottom: $space-2;
  }

  p,
  ul,
  ol {
    margin-bottom: $space-4;
  }

  ul,
  ol {
    padding-inline-start: $space-6;
  }

  li {
    margin-bottom: $space-2;
  }

  // Underline only inline links inside flowing text — block-level anchors
  // (cards, catalogs, components rendered via MDC) should remain undecorated.
  p a,
  li a,
  td a,
  blockquote a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
      color: var(--color-primary-hover);
    }
  }

  blockquote {
    margin: $space-6 0;
    padding: $space-4 $space-5;
    border-inline-start: 3px solid var(--color-primary);
    background: var(--bg-elevated);
    border-radius: $radius-sm;
    color: var(--text-secondary);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: $space-6 0;
    font-size: $text-sm;
  }

  th,
  td {
    padding: $space-3 $space-4;
    text-align: start;
    border-bottom: 1px solid var(--border-subtle);
  }

  th {
    font-weight: $weight-semibold;
    color: var(--text-primary);
    background: var(--bg-elevated);
  }

  hr {
    margin: $space-10 0;
    border: 0;
    border-top: 1px solid var(--border-subtle);
  }
}
</style>
