<script setup lang="ts">
interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

const props = defineProps<{
  links: TocLink[];
}>();

const flat = computed<TocLink[]>(() => {
  const out: TocLink[] = [];
  const walk = (items: TocLink[]) => {
    for (const item of items) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(props.links);
  return out;
});
</script>

<template>
  <nav v-if="flat.length" class="docs-toc" :aria-label="$t('docs.toc.label')">
    <h4 class="docs-toc__heading">{{ $t('docs.toc.label') }}</h4>
    <ul class="docs-toc__list">
      <li v-for="link in flat" :key="link.id" class="docs-toc__item" :data-depth="link.depth">
        <a :href="`#${link.id}`" class="docs-toc__link">{{ link.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.docs-toc {
  position: sticky;
  top: calc(#{$nav-height} + #{$space-8});
  width: $toc-width;
  max-height: calc(100vh - #{$nav-height} - #{$space-12});
  overflow-y: auto;
  padding-inline-start: $space-6;
  border-inline-start: 1px solid var(--border-subtle);

  &__heading {
    font-size: $text-xs;
    font-weight: $weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    margin-bottom: $space-3;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__item {
    &[data-depth='3'] {
      padding-inline-start: $space-3;
    }
    &[data-depth='4'] {
      padding-inline-start: $space-6;
    }
  }

  &__link {
    display: block;
    padding: $space-1 0;
    font-size: $text-sm;
    color: var(--text-secondary);
    line-height: $leading-snug;

    &:hover {
      color: var(--text-primary);
    }
  }
}
</style>
