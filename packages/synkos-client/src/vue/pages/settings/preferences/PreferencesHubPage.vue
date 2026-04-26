<template>
  <q-page class="preferences-page">
    <div class="preferences-scroll">
      <!-- ── APARIENCIA ─────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.apariencia')">
        <AppListRow
          :label="t('pages.settings.aparienciaSection.tema')"
          :hint="t('pages.settings.aparienciaSection.temaHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.aparienciaSection.tamanoTexto')"
          :hint="t('pages.settings.aparienciaSection.tamanoTextoHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── IDIOMA Y REGIÓN ────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.idioma')">
        <AppListRow
          :label="t('pages.settings.preferenciasSection.idiomaLabel')"
          :hint="currentLangLabel"
          @click="router.push({ name: 'settings-preferences-language' })"
        />
        <AppListDivider />
        <AppListRow :label="t('pages.settings.preferenciasSection.region')" disabled coming-soon />
      </AppListSection>

      <!-- ── ACCESIBILIDAD ──────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.accesibilidad')">
        <AppListRow
          :label="t('pages.settings.accesibilidadSection.contrasteAlto')"
          :hint="t('pages.settings.accesibilidadSection.contrasteAltoHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.accesibilidadSection.reducirAnimaciones')"
          :hint="t('pages.settings.accesibilidadSection.reducirAnimacionesHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── COMPORTAMIENTO ─────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.comportamiento')">
        <AppListRow
          :label="t('pages.settings.comportamientoSection.autoplay')"
          :hint="t('pages.settings.comportamientoSection.autoplayHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.comportamientoSection.descargas')"
          :hint="t('pages.settings.comportamientoSection.descargasHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── AVANZADO ───────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.avanzado')">
        <AppListRow :label="t('common.comingSoon')" disabled coming-soon />
      </AppListSection>

      <div style="height: 32px" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../../../../stores/settings.store.js';
import { AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();

// Show the active language as a hint on the Idioma row
const currentLangLabel = computed(() => t(`pages.settings.languages.${settingsStore.appLang}`));
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.preferences-scroll {
  padding-top: $space-4;
}
</style>
