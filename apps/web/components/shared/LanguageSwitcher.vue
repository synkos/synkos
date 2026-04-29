<script setup lang="ts">
const { locale, locales, setLocale } = useI18n();

const available = computed(() =>
  (locales.value as { code: string; name: string }[]).filter((l) => l.code !== locale.value)
);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function pick(code: string) {
  setLocale(code as 'en' | 'es');
  open.value = false;
}

function onDocClick(e: MouseEvent) {
  if (!root.value) return;
  if (!root.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => {
  document.addEventListener('click', onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
});
</script>

<template>
  <div ref="root" class="lang-switcher">
    <button
      class="lang-switcher__trigger"
      :aria-label="$t('common.changeLanguage')"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        />
      </svg>
      <span class="lang-switcher__code">{{ locale.toUpperCase() }}</span>
    </button>

    <div v-if="open" class="lang-switcher__menu">
      <button
        v-for="loc in available"
        :key="loc.code"
        class="lang-switcher__item"
        @click="pick(loc.code)"
      >
        {{ loc.name }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.lang-switcher {
  position: relative;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    height: 36px;
    padding: 0 $space-3;
    border-radius: $radius-sm;
    color: var(--text-secondary);
    font-size: $text-sm;
    font-weight: $weight-medium;
    transition: all $duration-fast $ease-out;

    &:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }
  }

  &__code {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  &__menu {
    position: absolute;
    inset-block-start: calc(100% + #{$space-2});
    inset-inline-end: 0;
    min-width: 140px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: $radius-md;
    box-shadow: var(--shadow-md);
    padding: $space-1;
    z-index: $z-overlay;
  }

  &__item {
    display: block;
    width: 100%;
    text-align: start;
    padding: $space-2 $space-3;
    border-radius: $radius-sm;
    font-size: $text-sm;
    color: var(--text-primary);
    transition: background $duration-fast $ease-out;

    &:hover {
      background: var(--bg-canvas);
    }
  }
}
</style>
