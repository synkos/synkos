<script setup lang="ts">
const { t } = useI18n();

useSeoMeta({
  title: 'Synkos — The fullstack mobile framework',
  description: t('landing.hero.subtitle'),
  ogTitle: 'Synkos',
  ogDescription: t('landing.hero.subtitle'),
  ogType: 'website',
});
</script>

<template>
  <div>
    <LandingHero />
    <LandingFeatures />
    <LandingCodeShowcase />
    <LandingCTA />
  </div>
</template>
