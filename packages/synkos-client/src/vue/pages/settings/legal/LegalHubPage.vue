<template>
  <AppPage class="legal-page">
    <div class="legal-scroll">
      <!-- ── Políticas ──────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.legalSection.sectionPoliticas')">
        <AppListRow
          :label="t('pages.settings.legalSection.terminos')"
          :hint="t('pages.settings.legalSection.terminosHint')"
          @click="showLegal('terms')"
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.legalSection.privacidad')"
          :hint="t('pages.settings.legalSection.privacidadHint')"
          @click="showLegal('privacy')"
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.legalSection.cookies')"
          :hint="t('pages.settings.legalSection.cookiesHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Otros ───────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.legalSection.sectionOtros')">
        <AppListRow
          :label="t('pages.settings.legalSection.licencias')"
          :hint="t('pages.settings.legalSection.licenciasHint')"
          disabled
          coming-soon
        />
        <AppListDivider />
        <AppListRow
          :label="t('pages.settings.legalSection.gdpr')"
          :hint="t('pages.settings.legalSection.gdprHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <div style="height: 32px" />
    </div>

    <LegalBottomSheet v-model:show="showSheet" :type="sheetType" />
  </AppPage>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AppPage, AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';
import LegalBottomSheet from '../../../components/LegalBottomSheet.vue';

const { t } = useI18n();

const showSheet = ref(false);
const sheetType = ref<'terms' | 'privacy'>('terms');

function showLegal(type: 'terms' | 'privacy'): void {
  sheetType.value = type;
  showSheet.value = true;
}
</script>

<style lang="scss" scoped>
.legal-scroll {
  padding-top: $space-4;
}
</style>
