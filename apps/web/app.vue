<script setup lang="ts">
const { theme } = useTheme();

useHead({
  htmlAttrs: computed(() => ({ 'data-theme': theme.value })),
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
