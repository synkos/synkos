<script setup lang="ts">
const { locale, t } = useI18n();

const collection = computed(() => (locale.value === 'es' ? 'es_blog' : 'en_blog'));

const { data: posts } = await useAsyncData(
  () => `blog:${collection.value}`,
  async () => {
    const all = await queryCollection(collection.value as 'en_blog' | 'es_blog')
      .order('date', 'DESC')
      .all();
    // Strip the leading "/<locale>" segment so NuxtLinkLocale can prepend it correctly.
    return all.map((p) => ({
      ...p,
      slug: p.path.replace(/^\/(en|es)\/blog\//, ''),
    }));
  },
  { default: () => [], watch: [collection] }
);

useSeoMeta({
  title: 'Blog — Synkos',
  description: t('blog.subtitle'),
});
</script>

<template>
  <section class="blog container">
    <header class="blog__header">
      <h1 class="blog__title">{{ t('blog.title') }}</h1>
      <p class="blog__subtitle">{{ t('blog.subtitle') }}</p>
    </header>

    <div v-if="posts?.length" class="blog__list">
      <article v-for="post in posts" :key="post.slug" class="blog__item">
        <NuxtLinkLocale :to="`/blog/${post.slug}`" class="blog__link">
          <time v-if="post.date" :datetime="post.date" class="blog__date">{{ post.date }}</time>
          <h2 class="blog__post-title">{{ post.title }}</h2>
          <p v-if="post.description" class="blog__post-desc">{{ post.description }}</p>
        </NuxtLinkLocale>
      </article>
    </div>

    <p v-else class="blog__empty">{{ t('blog.empty') }}</p>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.blog {
  padding: $space-16 $space-6 $space-24;
  max-width: 880px;

  &__header {
    margin-bottom: $space-12;
  }

  &__title {
    font-size: $text-5xl;
    font-weight: $weight-bold;
    letter-spacing: -0.03em;
    line-height: $leading-tight;
    color: var(--text-primary);
    margin-bottom: $space-3;
  }

  &__subtitle {
    color: var(--text-secondary);
    font-size: $text-lg;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__item {
    border-bottom: 1px solid var(--border-subtle);
  }

  &__link {
    display: block;
    padding: $space-6 0;
    color: inherit;

    &:hover {
      color: inherit;
    }

    &:hover .blog__post-title {
      color: var(--color-primary);
    }
  }

  &__date {
    display: block;
    font-size: $text-sm;
    color: var(--text-tertiary);
    margin-bottom: $space-2;
    font-variant-numeric: tabular-nums;
  }

  &__post-title {
    font-size: $text-xl;
    font-weight: $weight-semibold;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    margin-bottom: $space-2;
    transition: color $duration-fast $ease-out;
  }

  &__post-desc {
    color: var(--text-secondary);
    line-height: $leading-snug;
  }

  &__empty {
    color: var(--text-secondary);
    padding: $space-12 0;
  }
}
</style>
