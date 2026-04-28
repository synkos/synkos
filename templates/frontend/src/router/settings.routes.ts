import type { RouteRecordRaw } from 'vue-router';

/**
 * Settings + profile routes.
 *
 * All pages live in src/pages/settings/ — edit them freely.
 * Spread this array into your MainLayout children in router/index.ts.
 *
 * To add a new settings page:
 *   1. Create the page in src/pages/settings/
 *   2. Add a route here (path must start with 'settings/')
 *   3. Add it to AppMenuDrawer or link to it from another page
 */
export const settingsRoutes: RouteRecordRaw[] = [
  // ── Profile tab ─────────────────────────────────────────────────────────────
  {
    path: 'profile',
    name: 'profile',
    meta: { tab: { icon: 'person', labelKey: 'tabs.profile' } },
    component: () => import('src/pages/settings/ProfilePage.vue'),
  },

  // ── Account ─────────────────────────────────────────────────────────────────
  {
    path: 'settings/account',
    name: 'settings-account',
    meta: { titleKey: 'nav.myAccount' },
    component: () => import('src/pages/settings/account/AccountHubPage.vue'),
  },
  {
    path: 'settings/account/edit',
    name: 'settings-account-edit',
    meta: { titleKey: 'nav.editProfile', parentTitleKey: 'nav.myAccount' },
    component: () => import('src/pages/settings/account/EditProfilePage.vue'),
  },
  {
    path: 'settings/account/username',
    name: 'settings-account-username',
    meta: { titleKey: 'nav.changeUsername', parentTitleKey: 'nav.editProfile' },
    component: () => import('src/pages/settings/account/ChangeUsernamePage.vue'),
  },
  {
    path: 'settings/account/password',
    name: 'settings-account-password',
    meta: { titleKey: 'nav.changePassword', parentTitleKey: 'nav.editProfile' },
    component: () => import('src/pages/settings/account/ChangePasswordPage.vue'),
  },
  {
    path: 'settings/account/delete',
    name: 'settings-account-delete',
    meta: { titleKey: 'pages.deleteAccount.step1.title', parentTitleKey: 'nav.myAccount' },
    component: () => import('src/pages/settings/account/DeleteAccountPage.vue'),
  },

  // ── Preferences ─────────────────────────────────────────────────────────────
  {
    path: 'settings/preferences',
    name: 'settings-preferences',
    meta: { titleKey: 'nav.preferences' },
    component: () => import('src/pages/settings/preferences/PreferencesHubPage.vue'),
  },
  {
    path: 'settings/preferences/language',
    name: 'settings-preferences-language',
    meta: {
      titleKey: 'pages.settings.preferenciasSection.idioma',
      parentTitleKey: 'nav.preferences',
    },
    component: () => import('src/pages/settings/preferences/LanguagePage.vue'),
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  {
    path: 'settings/notifications',
    name: 'settings-notifications',
    meta: { titleKey: 'nav.notifications' },
    component: () => import('src/pages/settings/notifications/NotificationsHubPage.vue'),
  },

  // ── Security ─────────────────────────────────────────────────────────────────
  {
    path: 'settings/security',
    name: 'settings-security',
    meta: { titleKey: 'nav.security' },
    component: () => import('src/pages/settings/security/SecurityHubPage.vue'),
  },

  // ── Billing ──────────────────────────────────────────────────────────────────
  {
    path: 'settings/billing',
    name: 'settings-billing',
    meta: { titleKey: 'nav.billing' },
    component: () => import('src/pages/settings/billing/BillingHubPage.vue'),
  },

  // ── Support ──────────────────────────────────────────────────────────────────
  {
    path: 'settings/support',
    name: 'settings-support',
    meta: { titleKey: 'nav.support' },
    component: () => import('src/pages/settings/support/SupportHubPage.vue'),
  },
  {
    path: 'settings/support/help',
    name: 'settings-support-help',
    meta: { titleKey: 'nav.help', parentTitleKey: 'nav.support' },
    component: () => import('src/pages/settings/support/HelpPage.vue'),
  },

  // ── Legal ────────────────────────────────────────────────────────────────────
  {
    path: 'settings/legal',
    name: 'settings-legal',
    meta: { titleKey: 'nav.legal' },
    component: () => import('src/pages/settings/legal/LegalHubPage.vue'),
  },

  // ── About ────────────────────────────────────────────────────────────────────
  {
    path: 'settings/about',
    name: 'settings-about',
    meta: { titleKey: 'nav.acercaDe' },
    component: () => import('src/pages/settings/about/AboutHubPage.vue'),
  },
];
