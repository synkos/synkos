<template>
  <AppPage class="preferences-page">
    <div class="preferences-scroll">
      <!-- ── APARIENCIA ─────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.preferenciasSection.apariencia')">
        <div class="theme-control">
          <div class="theme-control__header">
            <span class="theme-control__label">{{
              t('pages.settings.aparienciaSection.tema')
            }}</span>
            <span class="theme-control__hint">{{
              t('pages.settings.aparienciaSection.temaHint')
            }}</span>
          </div>
          <SegmentControl
            :options="themeOptions"
            :model-value="settingsStore.theme"
            @update:model-value="(v) => settingsStore.setTheme(v as AppTheme)"
          />
        </div>
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
  </AppPage>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@synkos/client';
import type { AppTheme } from '@synkos/client';
import { AppPage, AppListRow, AppListSection, AppListDivider, SegmentControl } from '@synkos/ui';

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();

const currentLangLabel = computed(() => t(`pages.settings.languages.${settingsStore.appLang}`));

const themeOptions = computed(() => [
  { value: 'light', label: t('pages.settings.aparienciaSection.temaLight') },
  { value: 'dark', label: t('pages.settings.aparienciaSection.temaDark') },
  { value: 'system', label: t('pages.settings.aparienciaSection.temaSystem') },
]);
</script>

<style lang="scss" scoped>
.preferences-scroll {
  padding-top: $space-4;
}

.theme-control {
  display: flex;
  flex-direction: column;
  gap: $space-5;
  padding: $space-6 $space-8 $space-8;

  &__header {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__label {
    font-size: $font-body;
    font-weight: 400;
    color: var(--text-secondary, #{$text-secondary});
    letter-spacing: $ls-normal;
  }

  &__hint {
    font-size: $font-caption;
    color: var(--text-tertiary, #{$text-tertiary});
    letter-spacing: $ls-normal;
    line-height: 1.3;
  }
}
</style>
