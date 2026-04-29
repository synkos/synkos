<script setup lang="ts">
import manifest from '~/assets/generated/components.manifest.json';

interface Item {
  name: string;
  slug: string;
  category: string;
  sourcePackage: string;
  shortDescription?: string;
}

const CATEGORY_ORDER = [
  'Actions',
  'Layout',
  'Lists',
  'Forms',
  'Feedback',
  'Overlays',
  'Media',
  'Navigation',
  'Auth',
  'Other',
];

const grouped = computed(() => {
  const items = manifest as Item[];
  return CATEGORY_ORDER.map((cat) => ({
    name: cat,
    items: items.filter((m) => m.category === cat),
  })).filter((g) => g.items.length > 0);
});
</script>

<template>
  <div class="catalog">
    <section v-for="group in grouped" :key="group.name" class="catalog__group">
      <header class="catalog__head">
        <h2 class="catalog__title">{{ group.name }}</h2>
        <span class="catalog__count">{{ group.items.length }}</span>
      </header>

      <div class="catalog__grid">
        <NuxtLinkLocale
          v-for="item in group.items"
          :key="item.slug"
          :to="`/docs/components/${item.slug}`"
          class="catalog__card"
        >
          <div class="catalog__preview">
            <ComponentSilhouette :name="item.name" />
          </div>

          <div class="catalog__meta">
            <div class="catalog__name-row">
              <h3 class="catalog__name">{{ item.name }}</h3>
              <span
                class="catalog__pkg"
                :data-pkg="item.sourcePackage === '@synkos/ui' ? 'ui' : 'client'"
              >
                {{ item.sourcePackage === '@synkos/ui' ? 'ui' : 'client' }}
              </span>
            </div>
            <p v-if="item.shortDescription" class="catalog__desc">
              {{ item.shortDescription }}
            </p>
          </div>
        </NuxtLinkLocale>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.catalog {
  display: flex;
  flex-direction: column;
  gap: $space-12;
  margin-top: $space-8;

  &__group {
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__head {
    display: flex;
    align-items: baseline;
    gap: $space-3;
  }

  &__title {
    font-size: $text-md;
    font-weight: $weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-tertiary);
    margin: 0;
  }

  &__count {
    font-size: $text-xs;
    color: var(--text-tertiary);
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    border-radius: $radius-full;
    padding: 2px 8px;
    font-variant-numeric: tabular-nums;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $space-3;
  }

  &__card {
    display: flex;
    flex-direction: column;
    border-radius: $radius-lg;
    border: 1px solid var(--border-subtle);
    background: var(--bg-elevated);
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    transition:
      border-color $duration-fast $ease-out,
      transform $duration-fast $ease-out,
      box-shadow $duration-fast $ease-out;

    &:hover {
      border-color: var(--border-strong);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      color: inherit;

      .catalog__name {
        color: var(--color-primary);
      }
    }
  }

  &__preview {
    background: var(--bg-canvas);
    border-bottom: 1px solid var(--border-subtle);

    // The ComponentSilhouette already provides the inner sizing/centering.
    // Drop any margin so the silhouette can fill the card preview area.
    :deep(.sil) {
      margin: 0;
    }
  }

  &__meta {
    padding: $space-3 $space-4 $space-4;
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
  }

  &__name {
    font-size: $text-md;
    font-weight: $weight-semibold;
    color: var(--text-primary);
    margin: 0;
    transition: color $duration-fast $ease-out;
  }

  &__pkg {
    font-size: 10px;
    font-weight: $weight-semibold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 2px 6px;
    border-radius: $radius-sm;
    color: var(--text-tertiary);
    background: var(--bg-canvas);
    border: 1px solid var(--border-subtle);

    &[data-pkg='ui'] {
      color: var(--color-primary);
      border-color: var(--color-primary-soft);
      background: var(--color-primary-soft);
    }
  }

  &__desc {
    font-size: $text-sm;
    line-height: $leading-snug;
    color: var(--text-secondary);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
