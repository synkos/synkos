<template>
  <q-page class="notifications-page">
    <div class="notifications-scroll">
      <AppListSection :title="t('pages.settings.notifPage.title')">
        <AppListRow
          :label="t('pages.settings.notifications.push')"
          :hint="t('pages.settings.notifications.pushHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.notifPage.email')"
          :hint="t('pages.settings.notifPage.emailHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.notifPage.sms')"
          :hint="t('pages.settings.notifPage.smsHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.notifPage.categorias')"
          :hint="t('pages.settings.notifPage.categoriasHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.notifPage.frecuencia')"
          :hint="t('pages.settings.notifPage.frecuenciaHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.notifPage.historial')"
          :hint="t('pages.settings.notifPage.historialHint')"
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

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.notifications-scroll {
  padding-top: $space-4;
}
</style>
