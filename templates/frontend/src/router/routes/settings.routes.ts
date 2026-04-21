import type { RouteRecordRaw } from 'vue-router';

/**
 * Settings routes — all menu-access sections and their sub-pages.
 *
 * URL structure:  /settings/<section>[/<sub-page>[/<detail>]]
 * Name convention: settings-<section>[-<sub-page>[-<detail>]]
 *
 * titleKey / parentTitleKey are i18n keys resolved in MainLayout so they
 * update reactively when the locale changes — never hardcode Spanish strings.
 *
 * Pages not yet built are registered as lazy stubs (component omitted here,
 * add the import once the page is created).
 */
export const settingsRoutes: RouteRecordRaw[] = [
  // ── Account ─────────────────────────────────────────────────────────────
  {
    path: 'settings/account',
    name: 'settings-account',
    meta: { titleKey: 'nav.myAccount' },
    component: () => import('src/core/settings/account/pages/AccountHubPage.vue'),
  },
  {
    path: 'settings/account/edit',
    name: 'settings-account-edit',
    meta: { titleKey: 'nav.editProfile', parentTitleKey: 'nav.myAccount' },
    component: () => import('src/core/settings/account/pages/EditProfilePage.vue'),
  },
  {
    path: 'settings/account/username',
    name: 'settings-account-username',
    meta: { titleKey: 'nav.changeUsername', parentTitleKey: 'nav.editProfile' },
    component: () => import('src/core/settings/account/pages/ChangeUsernamePage.vue'),
  },
  {
    path: 'settings/account/password',
    name: 'settings-account-password',
    meta: { titleKey: 'nav.changePassword', parentTitleKey: 'nav.editProfile' },
    component: () => import('src/core/settings/account/pages/ChangePasswordPage.vue'),
  },
  {
    path: 'settings/account/delete',
    name: 'settings-account-delete',
    meta: { titleKey: 'pages.deleteAccount.step1.title', parentTitleKey: 'nav.myAccount' },
    component: () => import('src/core/settings/account/pages/DeleteAccountPage.vue'),
  },

  // ── Preferences ─────────────────────────────────────────────────────────
  {
    path: 'settings/preferences',
    name: 'settings-preferences',
    meta: { titleKey: 'nav.preferences' },
    component: () => import('src/core/settings/preferences/pages/PreferencesHubPage.vue'),
  },
  {
    path: 'settings/preferences/language',
    name: 'settings-preferences-language',
    meta: {
      titleKey: 'pages.settings.preferenciasSection.idioma',
      parentTitleKey: 'nav.preferences',
    },
    component: () => import('src/core/settings/preferences/pages/LanguagePage.vue'),
  },
  // Placeholder — create AppearancePage.vue when needed
  // {
  //   path: 'settings/preferences/appearance',
  //   name: 'settings-preferences-appearance',
  //   meta: { titleKey: 'pages.settings.preferenciasSection.apariencia', parentTitleKey: 'nav.preferences' },
  //   component: () => import('src/core/settings/preferences/pages/AppearancePage.vue'),
  // },
  // {
  //   path: 'settings/preferences/accessibility',
  //   name: 'settings-preferences-accessibility',
  //   meta: { titleKey: 'pages.settings.preferenciasSection.accesibilidad', parentTitleKey: 'nav.preferences' },
  //   component: () => import('src/core/settings/preferences/pages/AccessibilityPage.vue'),
  // },
  // {
  //   path: 'settings/preferences/behavior',
  //   name: 'settings-preferences-behavior',
  //   meta: { titleKey: 'pages.settings.preferenciasSection.comportamiento', parentTitleKey: 'nav.preferences' },
  //   component: () => import('src/core/settings/preferences/pages/BehaviorPage.vue'),
  // },

  // ── Notifications ────────────────────────────────────────────────────────
  {
    path: 'settings/notifications',
    name: 'settings-notifications',
    meta: { titleKey: 'nav.notifications' },
    component: () => import('src/core/settings/notifications/pages/NotificationsHubPage.vue'),
  },
  // {
  //   path: 'settings/notifications/categories',
  //   name: 'settings-notifications-categories',
  //   meta: { titleKey: 'pages.settings.notifPage.categorias', parentTitleKey: 'nav.notifications' },
  //   component: () => import('src/core/settings/notifications/pages/NotifCategoriesPage.vue'),
  // },
  // {
  //   path: 'settings/notifications/frequency',
  //   name: 'settings-notifications-frequency',
  //   meta: { titleKey: 'pages.settings.notifPage.frecuencia', parentTitleKey: 'nav.notifications' },
  //   component: () => import('src/core/settings/notifications/pages/NotifFrequencyPage.vue'),
  // },

  // ── Security ─────────────────────────────────────────────────────────────
  {
    path: 'settings/security',
    name: 'settings-security',
    meta: { titleKey: 'nav.security' },
    component: () => import('src/core/settings/security/pages/SecurityHubPage.vue'),
  },
  // {
  //   path: 'settings/security/password',
  //   name: 'settings-security-password',
  //   meta: { titleKey: 'pages.settings.seguridadSection.contrasena', parentTitleKey: 'nav.security' },
  //   component: () => import('src/core/settings/security/pages/SecurityPasswordPage.vue'),
  // },
  // {
  //   path: 'settings/security/two-factor',
  //   name: 'settings-security-two-factor',
  //   meta: { titleKey: 'pages.settings.seguridadSection.dosFactor', parentTitleKey: 'nav.security' },
  //   component: () => import('src/core/settings/security/pages/TwoFactorPage.vue'),
  // },
  // {
  //   path: 'settings/security/devices',
  //   name: 'settings-security-devices',
  //   meta: { titleKey: 'pages.settings.seguridadSection.dispositivos', parentTitleKey: 'nav.security' },
  //   component: () => import('src/core/settings/security/pages/DevicesPage.vue'),
  // },
  // {
  //   path: 'settings/security/activity',
  //   name: 'settings-security-activity',
  //   meta: { titleKey: 'pages.settings.seguridadSection.actividad', parentTitleKey: 'nav.security' },
  //   component: () => import('src/core/settings/security/pages/ActivityPage.vue'),
  // },
  // {
  //   path: 'settings/security/recovery-codes',
  //   name: 'settings-security-recovery-codes',
  //   meta: { titleKey: 'pages.settings.seguridadSection.codigos', parentTitleKey: 'nav.security' },
  //   component: () => import('src/core/settings/security/pages/RecoveryCodesPage.vue'),
  // },

  // ── Billing ──────────────────────────────────────────────────────────────
  {
    path: 'settings/billing',
    name: 'settings-billing',
    meta: { titleKey: 'nav.billing' },
    component: () => import('src/core/settings/billing/pages/BillingHubPage.vue'),
  },
  // {
  //   path: 'settings/billing/plan',
  //   name: 'settings-billing-plan',
  //   meta: { titleKey: 'pages.settings.facturacionSection.planActual', parentTitleKey: 'nav.billing' },
  //   component: () => import('src/core/settings/billing/pages/BillingPlanPage.vue'),
  // },
  // {
  //   path: 'settings/billing/payment-methods',
  //   name: 'settings-billing-payment-methods',
  //   meta: { titleKey: 'pages.settings.facturacionSection.metodoPago', parentTitleKey: 'nav.billing' },
  //   component: () => import('src/core/settings/billing/pages/PaymentMethodsPage.vue'),
  // },
  // {
  //   path: 'settings/billing/invoices',
  //   name: 'settings-billing-invoices',
  //   meta: { titleKey: 'pages.settings.facturacionSection.facturas', parentTitleKey: 'nav.billing' },
  //   component: () => import('src/core/settings/billing/pages/InvoicesPage.vue'),
  // },

  // ── Support ──────────────────────────────────────────────────────────────
  {
    path: 'settings/support',
    name: 'settings-support',
    meta: { titleKey: 'nav.support' },
    component: () => import('src/core/settings/support/pages/SupportHubPage.vue'),
  },
  {
    path: 'settings/support/help',
    name: 'settings-support-help',
    meta: { titleKey: 'nav.help', parentTitleKey: 'nav.support' },
    component: () => import('src/core/settings/support/pages/HelpPage.vue'),
  },
  // {
  //   path: 'settings/support/contact',
  //   name: 'settings-support-contact',
  //   meta: { titleKey: 'pages.settings.soporteSection.contactar', parentTitleKey: 'nav.support' },
  //   component: () => import('src/core/settings/support/pages/ContactPage.vue'),
  // },
  // {
  //   path: 'settings/support/report',
  //   name: 'settings-support-report',
  //   meta: { titleKey: 'pages.settings.soporteSection.reportar', parentTitleKey: 'nav.support' },
  //   component: () => import('src/core/settings/support/pages/ReportPage.vue'),
  // },

  // ── Legal ────────────────────────────────────────────────────────────────
  {
    path: 'settings/legal',
    name: 'settings-legal',
    meta: { titleKey: 'nav.legal' },
    component: () => import('src/core/settings/legal/pages/LegalHubPage.vue'),
  },
  // {
  //   path: 'settings/legal/terms',
  //   name: 'settings-legal-terms',
  //   meta: { titleKey: 'pages.settings.legalSection.terminos', parentTitleKey: 'nav.legal' },
  //   component: () => import('src/core/settings/legal/pages/TermsPage.vue'),
  // },
  // {
  //   path: 'settings/legal/privacy',
  //   name: 'settings-legal-privacy',
  //   meta: { titleKey: 'pages.settings.legalSection.privacidad', parentTitleKey: 'nav.legal' },
  //   component: () => import('src/core/settings/legal/pages/PrivacyPage.vue'),
  // },
  // {
  //   path: 'settings/legal/cookies',
  //   name: 'settings-legal-cookies',
  //   meta: { titleKey: 'pages.settings.legalSection.cookies', parentTitleKey: 'nav.legal' },
  //   component: () => import('src/core/settings/legal/pages/CookiesPage.vue'),
  // },
  // {
  //   path: 'settings/legal/licenses',
  //   name: 'settings-legal-licenses',
  //   meta: { titleKey: 'pages.settings.legalSection.licencias', parentTitleKey: 'nav.legal' },
  //   component: () => import('src/core/settings/legal/pages/LicensesPage.vue'),
  // },
  // {
  //   path: 'settings/legal/gdpr',
  //   name: 'settings-legal-gdpr',
  //   meta: { titleKey: 'pages.settings.legalSection.gdpr', parentTitleKey: 'nav.legal' },
  //   component: () => import('src/core/settings/legal/pages/GdprPage.vue'),
  // },

  // ── About ────────────────────────────────────────────────────────────────
  {
    path: 'settings/about',
    name: 'settings-about',
    meta: { titleKey: 'nav.acercaDe' },
    component: () => import('src/core/settings/about/pages/AboutHubPage.vue'),
  },
  // {
  //   path: 'settings/about/whats-new',
  //   name: 'settings-about-whats-new',
  //   meta: { titleKey: 'pages.about.whatsNew', parentTitleKey: 'nav.acercaDe' },
  //   component: () => import('src/core/settings/about/pages/WhatsNewPage.vue'),
  // },
  // {
  //   path: 'settings/about/company',
  //   name: 'settings-about-company',
  //   meta: { titleKey: 'pages.about.empresa', parentTitleKey: 'nav.acercaDe' },
  //   component: () => import('src/core/settings/about/pages/CompanyPage.vue'),
  // },
  // {
  //   path: 'settings/about/credits',
  //   name: 'settings-about-credits',
  //   meta: { titleKey: 'pages.about.creditos', parentTitleKey: 'nav.acercaDe' },
  //   component: () => import('src/core/settings/about/pages/CreditsPage.vue'),
  // },
];
