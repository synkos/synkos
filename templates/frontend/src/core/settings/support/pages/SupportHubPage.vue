<template>
  <q-page class="support-page">
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
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import AppListRow from 'src/core/components/ui/AppListRow.vue';
import AppListSection from 'src/core/components/ui/AppListSection.vue';
import AppListDivider from 'src/core/components/ui/AppListDivider.vue';
import { appConfig } from 'src/app.config';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.support-scroll {
  padding-top: $space-4;
}
</style>
