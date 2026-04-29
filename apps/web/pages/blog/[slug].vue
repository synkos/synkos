<script setup lang="ts">
const route = useRoute();
const { locale, t } = useI18n();

const collection = computed(() => (locale.value === 'es' ? 'es_blog' : 'en_blog'));
const contentPath = computed(() => `/${locale.value}/blog/${route.params.slug as string}`);

const { data: post } = await useAsyncData(
  () => `${collection.value}:${contentPath.value}`,
  async () => {
    const result = await queryCollection(collection.value as 'en_blog' | 'es_blog')
      .path(contentPath.value)
      .first();
    return result ?? null;
  },
  { default: () => null, watch: [contentPath, collection] }
);

useSeoMeta({
  title: () => (post.value?.title ? `${post.value.title} — Synkos Blog` : 'Synkos Blog'),
  description: () => post.value?.description ?? '',
});
</script>

<template>
  <article v-if="post" class="post container">
    <NuxtLinkLocale to="/blog" class="post__back">← {{ t('blog.back') }}</NuxtLinkLocale>
    <header class="post__header">
      <time v-if="post.date" :datetime="post.date" class="post__date">{{ post.date }}</time>
      <h1 class="post__title">{{ post.title }}</h1>
      <p v-if="post.description" class="post__desc">{{ post.description }}</p>
    </header>
    <ContentRenderer :value="post" class="prose" />
  </article>

  <div v-else class="post container">
    <p>{{ t('blog.notFound') }}</p>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.post {
  padding: $space-12 $space-6 $space-24;
  max-width: 760px;

  &__back {
    display: inline-block;
    color: var(--text-secondary);
    margin-bottom: $space-8;
    font-size: $text-sm;

    &:hover {
      color: var(--text-primary);
    }
  }

  &__header {
    margin-bottom: $space-10;
    padding-bottom: $space-6;
    border-bottom: 1px solid var(--border-subtle);
  }

  &__date {
    display: block;
    color: var(--text-tertiary);
    font-size: $text-sm;
    margin-bottom: $space-3;
    font-variant-numeric: tabular-nums;
  }

  &__title {
    font-size: $text-4xl;
    font-weight: $weight-bold;
    letter-spacing: -0.025em;
    line-height: $leading-tight;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__desc {
    color: var(--text-secondary);
    font-size: $text-lg;
  }
}

:deep(.prose) {
  color: var(--text-primary);
  line-height: $leading-relaxed;

  h2,
  h3 {
    font-weight: $weight-semibold;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  h2 {
    font-size: $text-2xl;
    margin-top: $space-10;
    margin-bottom: $space-4;
  }

  h3 {
    font-size: $text-xl;
    margin-top: $space-8;
    margin-bottom: $space-3;
  }

  p,
  ul,
  ol {
    margin-bottom: $space-4;
  }

  p a,
  li a,
  td a,
  blockquote a {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
</style>
