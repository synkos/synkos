<script setup lang="ts">
defineProps<{
  size?: number;
}>();
</script>

<template>
  <NuxtLinkLocale to="/" class="logo" :aria-label="$t('common.brand')">
    <svg
      class="logo__mark"
      :width="size ?? 28"
      :height="size ?? 28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="synkos-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="var(--color-primary)" />
          <stop offset="1" stop-color="var(--color-accent)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2L29 9V23L16 30L3 23V9L16 2Z"
        stroke="url(#synkos-gradient)"
        stroke-width="2.2"
        stroke-linejoin="round"
      />
      <path
        d="M11 12C11 14 13 15 15 15.5C18 16 21 17.2 21 20C21 22.5 18.5 24 16 24C13.8 24 11.8 23 11 21"
        stroke="url(#synkos-gradient)"
        stroke-width="2.2"
        stroke-linecap="round"
      />
    </svg>
    <span class="logo__name">Synkos</span>
  </NuxtLinkLocale>
</template>

<style lang="scss" scoped>
@use '~/assets/css/tokens' as *;

.logo {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  color: var(--text-primary);
  font-weight: $weight-bold;
  font-size: $text-lg;
  letter-spacing: -0.01em;

  &:hover {
    color: var(--text-primary);
  }

  &__mark {
    flex-shrink: 0;
  }
}
</style>
