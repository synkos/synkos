<template>
  <AppPage class="settings-subpage">
    <div class="subpage-scroll">
      <div class="section">
        <p class="section-header">{{ t('pages.settings.sections.language') }}</p>
        <div class="list-group">
          <div class="list-row list-row--block">
            <span class="row-label">{{ t('pages.settings.appLanguage') }}</span>
            <SegmentControl
              :options="appLangs"
              :model-value="settingsStore.appLang"
              @update:model-value="settingsStore.setAppLang($event as string)"
            />
          </div>
        </div>
      </div>

      <div style="height: 32px" />
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSettings } from '../../../composables/useSettings.js';
import { AppPage, SegmentControl } from '@synkos/ui';

const { t } = useI18n();
const { settingsStore, appLangs } = useSettings();
</script>

<style lang="scss" scoped>
.subpage-scroll {
  padding-top: $space-4;
}

.section {
  padding: 0 $space-8 $space-2;
}

.section-header {
  font-size: 12px;
  font-weight: 600;
  color: rgba(235, 235, 245, 0.45);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 16px 4px 6px;
  margin: 0;
}

.list-group {
  background: rgba(255, 255, 255, 0.06);
  border: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-height: 52px;

  &--block {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 16px;
    gap: 10px;
  }
}

.row-label {
  font-size: 15px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.1px;
  flex: 1;
}
</style>
