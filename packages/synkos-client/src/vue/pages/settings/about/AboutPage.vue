<template>
  <q-page class="about-page">
    <div class="about-scroll">
      <!-- ── App hero ──────────────────────────────────────────────── -->
      <div class="app-hero">
        <div class="app-icon-wrap">
          <q-icon name="verified" size="40px" color="white" />
        </div>
        <p class="app-name">{{ appConfig.name }}</p>
        <p class="app-version">{{ t('pages.about.version') }} {{ appVersion }}</p>
      </div>

      <!-- ── INFORMATION ───────────────────────────────────────────── -->
      <AppListSection :title="t('pages.about.sections.information')">
        <AppListRow :label="t('pages.about.whatsNew')" disabled coming-soon />
        <AppListDivider />
        <AppListRow :label="t('pages.about.privacy')" @click="showLegal('privacy')" />
        <AppListDivider />
        <AppListRow :label="t('pages.about.terms')" @click="showLegal('terms')" />
        <AppListDivider />
        <AppListRow :label="t('pages.about.licenses')" disabled coming-soon />
      </AppListSection>

      <!-- ── SUPPORT ───────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.about.sections.support')">
        <AppListRow
          :label="t('pages.about.rate', { appName: appConfig.name })"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow :label="t('pages.about.feedback')" disabled coming-soon />
        <AppListDivider />
        <AppListRow :label="t('pages.about.contact')" disabled coming-soon />
      </AppListSection>

      <!-- ── Copyright ─────────────────────────────────────────────── -->
      <p class="copyright">
        {{ t('pages.about.copyright', { year: currentYear, appName: appConfig.name }) }}
      </p>
    </div>

    <!-- ── Legal sheets ──────────────────────────────────────────────── -->
    <LegalBottomSheet v-model:show="showLegalSheet" :type="legalSheetType" />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';
import LegalBottomSheet from '../../../components/LegalBottomSheet.vue';
import { getClientConfig } from '../../../../internal/app-config.js';
const appConfig = getClientConfig();

const { t } = useI18n();

const appVersion = appConfig.version;
const currentYear = new Date().getFullYear();

const showLegalSheet = ref(false);
const legalSheetType = ref<'terms' | 'privacy'>('privacy');

function showLegal(type: 'terms' | 'privacy'): void {
  legalSheetType.value = type;
  showLegalSheet.value = true;
}
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
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
