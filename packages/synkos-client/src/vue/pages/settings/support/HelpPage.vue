<template>
  <AppPage class="help-page">
    <div class="help-scroll">
      <!-- ── GET HELP ──────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.help.sections.getHelp')">
        <AppListRow
          icon="quiz"
          icon-color="#0A84FF"
          icon-bg="rgba(10, 132, 255, 0.15)"
          :label="t('pages.help.faq')"
          :hint="t('pages.help.faqHint')"
          disabled
          coming-soon
        />
        <AppListDivider :indent="60" />
        <AppListRow
          icon="play_circle_outline"
          icon-color="#5E5CE6"
          icon-bg="rgba(94, 92, 230, 0.15)"
          :label="t('pages.help.howItWorks', { appName: appConfig.name })"
          :hint="t('pages.help.howItWorksHint')"
          disabled
          coming-soon
        />
        <AppListDivider :indent="60" />
        <AppListRow
          icon="new_releases"
          icon-color="#FF9F0A"
          icon-bg="rgba(255, 159, 10, 0.15)"
          :label="t('pages.help.changelog')"
          :hint="t('pages.help.changelogHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── FEEDBACK ──────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.help.sections.feedback')">
        <AppListRow
          icon="rate_review"
          icon-color="#30D158"
          icon-bg="rgba(48, 209, 88, 0.15)"
          :label="t('pages.help.sendFeedback')"
          :hint="t('pages.help.sendFeedbackHint')"
          disabled
          coming-soon
        />
        <AppListDivider :indent="60" />
        <AppListRow
          icon="bug_report"
          icon-color="#FF453A"
          icon-bg="rgba(255, 69, 58, 0.12)"
          :label="t('pages.help.reportBug')"
          :hint="t('pages.help.reportBugHint')"
          disabled
          coming-soon
        />
        <AppListDivider :indent="60" />
        <AppListRow
          icon="lightbulb_outline"
          icon-color="#FF9F0A"
          icon-bg="rgba(255, 159, 10, 0.15)"
          :label="t('pages.help.requestFeature')"
          :hint="t('pages.help.requestFeatureHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── CONTACT ───────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.help.sections.contact')">
        <AppListRow
          icon="mail_outline"
          icon-color="#0A84FF"
          icon-bg="rgba(10, 132, 255, 0.15)"
          :label="t('pages.help.contactSupport')"
          :hint="t('pages.help.contactSupportHint')"
          disabled
          coming-soon
        />
        <AppListDivider :indent="60" />
        <AppListRow
          icon="forum"
          icon-color="#5E5CE6"
          icon-bg="rgba(94, 92, 230, 0.15)"
          :label="t('pages.help.community')"
          :hint="t('pages.help.communityHint')"
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
import { getClientConfig } from '../../../../internal/app-config.js';
const appConfig = getClientConfig();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.help-scroll {
  padding-top: $space-4;
}
</style>
