<template>
  <q-page class="security-page">
    <div class="security-scroll">
      <!-- ── Acceso ─────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.seguridadSection.sectionAcceso')">
        <AppListRow
          :label="t('pages.settings.seguridadSection.contrasena')"
          :hint="t('pages.settings.seguridadSection.contrasenaHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.seguridadSection.dosFactor')"
          :hint="t('pages.settings.seguridadSection.dosFactorHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.seguridadSection.biometrico')"
          :hint="t('pages.settings.seguridadSection.biometricoHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Dispositivos y actividad ──────────────────────────────── -->
      <AppListSection :title="t('pages.settings.seguridadSection.sectionDispositivos')">
        <AppListRow
          :label="t('pages.settings.seguridadSection.dispositivos')"
          :hint="t('pages.settings.seguridadSection.dispositivosHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.seguridadSection.actividad')"
          :hint="t('pages.settings.seguridadSection.actividadHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Recuperación ───────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.seguridadSection.sectionRecuperacion')">
        <AppListRow
          :label="t('pages.settings.seguridadSection.codigos')"
          :hint="t('pages.settings.seguridadSection.codigosHint')"
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
import { AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.security-scroll {
  padding-top: $space-4;
}
</style>
