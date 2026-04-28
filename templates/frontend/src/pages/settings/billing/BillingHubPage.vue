<template>
  <AppPage class="billing-page">
    <div class="billing-scroll">
      <!-- ── Plan ─────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.facturacionSection.sectionPlan')">
        <AppListRow
          :label="t('pages.settings.facturacionSection.planActual')"
          :value="t('pages.settings.facturacionSection.planActualValue')"
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.facturacionSection.cambiarPlan')"
          :hint="t('pages.settings.facturacionSection.cambiarPlanHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Pagos ─────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.facturacionSection.sectionPagos')">
        <AppListRow
          :label="t('pages.settings.facturacionSection.metodoPago')"
          :hint="t('pages.settings.facturacionSection.metodoPagoHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.facturacionSection.facturas')"
          :hint="t('pages.settings.facturacionSection.facturasHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Zona crítica ───────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.menu.sections.danger')">
        <AppListRow
          :label="t('pages.settings.facturacionSection.cancelar')"
          :hint="t('pages.settings.facturacionSection.cancelarHint')"
          danger
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

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.billing-scroll {
  padding-top: $space-4;
}
</style>
