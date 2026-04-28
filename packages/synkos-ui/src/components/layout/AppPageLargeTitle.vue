<template>
  <div ref="titleEl" class="app-page-large-title">
    <div class="title-row">
      <h1 class="large-title">{{ title }}</h1>
      <slot name="right" />
    </div>
    <p v-if="subtitle" class="large-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  subtitle?: string;
}>();

// Injected by MainLayout — collapses the title into the nav bar on scroll.
// Falls back to a no-op if used outside a Synkos layout.
const setNavTitle = inject<(title: string | null) => void>('synkos:set-nav-title', () => {});

const titleEl = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

function setupObserver() {
  if (!titleEl.value) return;
  observer?.disconnect();

  observer = new IntersectionObserver(
    ([entry]) => {
      // When the large title is fully or partially hidden above the fold, inject
      // the compact title into the nav bar. When it's back in view, clear it.
      setNavTitle(entry.isIntersecting ? null : props.title);
    },
    {
      // A thin horizontal threshold at the top of the scroll container:
      // fires as soon as the title's top edge leaves the visible area.
      threshold: 0,
      rootMargin: '-1px 0px 0px 0px',
    }
  );

  observer.observe(titleEl.value);
}

onMounted(setupObserver);

// Re-observe if the title text changes (e.g., async data load)
watch(
  () => props.title,
  (newTitle) => {
    // If already collapsed, update the nav bar title immediately
    if (titleEl.value) {
      const rect = titleEl.value.getBoundingClientRect();
      if (rect.bottom <= 0) setNavTitle(newTitle);
    }
  }
);

onUnmounted(() => {
  observer?.disconnect();
  setNavTitle(null);
});
</script>

<style lang="scss" scoped>
.app-page-large-title {
  padding: $space-10 $space-10 0;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.large-title {
  font-size: $font-display;
  font-weight: 700;
  color: var(--text-primary, #{$text-primary});
  letter-spacing: $ls-tight;
  margin: 0;
  line-height: $lh-tight;
}

.large-subtitle {
  font-size: $font-body;
  color: var(--text-label, #{$text-label});
  line-height: $lh-relaxed;
  margin: $space-4 0 0;
  white-space: pre-line;
}
</style>
