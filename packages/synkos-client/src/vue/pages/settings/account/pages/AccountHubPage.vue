<template>
  <AppPage class="account-page">
    <div class="account-scroll">
      <!-- ── Perfil ─────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.cuentaSection.sections.perfil')">
        <AppListRow
          :label="t('pages.settings.accountHub.editarPerfil')"
          :hint="t('pages.settings.accountHub.editarPerfilHint')"
          @click="router.push({ name: 'settings-account-edit' })"
        />
      </AppListSection>

      <!-- ── Cuenta ─────────────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.cuentaSection.sections.cuenta')">
        <AppListRow
          :label="t('pages.settings.accountHub.gestion')"
          :hint="t('pages.settings.cuentaSection.gestionHint')"
          disabled
          coming-soon
        />
      </AppListSection>

      <!-- ── Zona crítica ───────────────────────────────────────────── -->
      <AppListSection :title="t('pages.settings.menu.sections.danger')">
        <AppListRow
          :label="t('pages.settings.accountHub.eliminarCuenta')"
          :hint="t('pages.settings.accountHub.eliminarCuentaHint')"
          danger
          @click="router.push({ name: 'settings-account-delete' })"
        />
        <AppListDivider />
        <AppListRow
          :label="authStore.isGuest ? t('pages.profile.exitGuest') : t('pages.profile.signOut')"
          danger
          @click="openSignOut"
        />
      </AppListSection>

      <div style="height: 32px" />
    </div>
  </AppPage>

  <SignOutDialog
    v-model="showSignOutDialog"
    :sign-out-state="signOutState"
    :is-processing="signingOut"
    :is-guest="wasGuest"
    @confirm="confirmSignOut"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../../../auth/store.js';
import { useSignOut } from '../../../../../composables/useSignOut.js';
import { AppPage, AppListRow } from '@synkos/ui';
import { AppListSection } from '@synkos/ui';
import { AppListDivider } from '@synkos/ui';
import SignOutDialog from '../components/SignOutDialog.vue';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const {
  showDialog: showSignOutDialog,
  state: signOutState,
  isProcessing: signingOut,
  wasGuest,
  open: openSignOut,
  confirm: confirmSignOut,
} = useSignOut();
</script>

<style lang="scss" scoped>
// q-page background and min-height are handled globally in app.scss
.account-scroll {
  padding-top: $space-4;
}
</style>
