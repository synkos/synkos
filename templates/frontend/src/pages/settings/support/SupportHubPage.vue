<template>
  <AppPage class="support-page">
    <div class="support-scroll">
      <!-- ── OBTENER AYUDA ──────────────────────────────────────────── -->
      <AppListSection :title="t('pages.help.sections.getHelp')">
        <AppListRow
          :label="t('pages.help.faq')"
          :hint="t('pages.help.faqHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.help.howItWorks', { appName: appConfig.name })"
          :hint="t('pages.help.howItWorksHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.soporteSection.contactar')"
          :hint="t('pages.settings.soporteSection.contactarOptions')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── FEEDBACK ───────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.help.sections.feedback')">
        <AppListRow
          :label="t('pages.help.sendFeedback')"
          :hint="t('pages.help.sendFeedbackHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.help.reportBug')"
          :hint="t('pages.help.reportBugHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── ESTADO DEL SERVICIO ────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.soporteSection.sectionEstado')">
        <AppListRow
          :label="t('pages.settings.soporteSection.estado')"
          :hint="t('pages.settings.soporteSection.estadoHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <div style="height: 32px" />
    </div>
  </AppPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { AppPage, AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';
import { getClientConfig } from '@synkos/client';
const appConfig = getClientConfig();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.support-scroll {
  padding-top: $space-4;
}
</style>
