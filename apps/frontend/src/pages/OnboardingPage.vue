<template>
  <div class="onboarding-page">
    <div class="content">
      <h1 class="title">Bienvenido</h1>
      <p class="subtitle">Reemplaza esta página con tu propio onboarding.</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.onboarding-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-12;
}

.content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.title {
  font-size: $font-display;
  font-weight: 700;
  color: var(--text-primary, rgba(255, 255, 255, 0.95));
  letter-spacing: $ls-tighter;
  margin: 0;
}

.subtitle {
  font-size: $font-body;
  color: var(--text-label, rgba(235, 235, 245, 0.45));
  margin: 0;
  line-height: $lh-relaxed;
}
</style>
