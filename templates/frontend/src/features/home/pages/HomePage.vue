<template>
  <AppPage class="home-page">
    <div class="home-content">
      <div class="home-icon">
        <AppIcon name="style" size="52px" style="color: var(--color-primary)" />
      </div>

      <h1 class="home-title">{{ t('pages.home.title') }}</h1>
      <p class="home-subtitle">{{ t('pages.home.subtitle') }}</p>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { AppPage, AppIcon } from '@synkos/ui';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 32px;
  gap: 0;
}

.home-icon {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: var(--surface-1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
  border: 0.5px solid var(--border-subtle);
}

.home-title {
  font-size: 34px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin: 0 0 12px 0;
  line-height: 1.1;
}

.home-subtitle {
  font-size: 17px;
  font-weight: 400;
  color: var(--text-secondary-ios);
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}
</style>
