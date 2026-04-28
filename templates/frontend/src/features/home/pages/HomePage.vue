<template>
  <AppPage class="home-page">
    <div class="home-content">
      <div class="home-icon">
        <AppIcon name="style" size="52px" style="color: #fff" />
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
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
  border: 0.5px solid rgba(255, 255, 255, 0.12);
}

.home-title {
  font-size: 34px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.5px;
  margin: 0 0 12px 0;
  line-height: 1.1;
}

.home-subtitle {
  font-size: 17px;
  font-weight: 400;
  color: rgba(235, 235, 245, 0.55);
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}
</style>
