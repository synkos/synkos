<template>
  <AppPage class="about-page">
    <div class="about-scroll">
      <!-- ── App hero ──────────────────────────────────────────────── -->
      <div class="app-hero">
        <div class="app-icon-wrap">
          <AppIcon name="verified" size="40px" style="color: #fff" />
        </div>
        <p class="app-name">{{ appConfig.name }}</p>
        <p class="app-version">{{ t('pages.about.version') }} {{ appVersion }}</p>
      </div>

      <!-- ── OPCIONES ──────────────────────────────────────────────── -->
      <AppListSection :title="t('nav.acercaDe')">
        <AppListRow
          :label="t('pages.about.version')"
          :hint="t('pages.about.versionHint')"
          :value="appVersion"
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.about.releaseNotes')"
          :hint="t('pages.about.releaseNotesHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.about.whatsNew')"
          :hint="t('pages.about.whatsNewHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.about.empresa')"
          :hint="t('pages.about.empresaHint', { appName: appConfig.name })"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.about.creditos')"
          :hint="t('pages.about.creditosHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <p class="copyright">
        {{ t('pages.about.copyright', { year: currentYear, appName: appConfig.name }) }}
      </p>
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AppIcon, AppPage, AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';
import { getClientConfig } from '../../../../internal/app-config.js';
const appConfig = getClientConfig();

const { t } = useI18n();

const appVersion = appConfig.version;
const currentYear = new Date().getFullYear();
</script>

<style lang="scss" scoped>
.about-scroll {
  padding-top: $space-4;
  padding-bottom: $space-16;
}

// ── App hero ──────────────────────────────────────────────────────
.app-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 24px;
  gap: 8px;
}

.app-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(145deg, #5e5ce6, #0a84ff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(10, 132, 255, 0.3);
  margin-bottom: 4px;
}

.app-name {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: -0.4px;
  margin: 0;
}

.app-version {
  font-size: 13px;
  color: rgba(235, 235, 245, 0.42);
  letter-spacing: -0.1px;
  margin: 0;
}

// ── Copyright ─────────────────────────────────────────────────────
.copyright {
  font-size: 12px;
  color: rgba(235, 235, 245, 0.22);
  text-align: center;
  padding: 24px 16px 0;
  margin: 0;
  letter-spacing: 0.1px;
}
</style>
