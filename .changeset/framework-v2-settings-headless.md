---
'@synkos/client': minor
'create-synkos': patch
---

Framework v2 — settings y profile pages movidas al template (headless completo)

Todas las páginas de settings y profile ahora viven en el proyecto del developer, igual que las páginas de auth. El paquete provee stores, servicios y componentes — no páginas.

**Nuevo en el template:**

```
src/pages/settings/
├── ProfilePage.vue
├── components/ProfileHeader.vue
├── about/  AboutHubPage.vue + AboutPage.vue
├── account/ AccountHubPage.vue + EditProfilePage.vue + ChangePasswordPage.vue
│            ChangeUsernamePage.vue + DeleteAccountPage.vue
│            components/SignOutDialog.vue
├── billing/  BillingHubPage.vue          ← integra Stripe, RevenueCat, etc.
├── legal/    LegalHubPage.vue            ← tus propios términos
├── notifications/ NotificationsHubPage.vue
├── preferences/  PreferencesHubPage.vue + LanguagePage.vue
├── security/ SecurityHubPage.vue
└── support/  SupportHubPage.vue + HelpPage.vue

src/router/settings.routes.ts   ← todas las rutas definidas, editables
```

Todas las páginas importan del API público de `@synkos/client` (`useAuthStore`, `useSettingsStore`, `useSettings`, `useSignOut`, `getClientConfig`, `LegalBottomSheet`, etc.).

**`router/index.ts`** usa `...settingsRoutes` del archivo local en lugar de `...synkosSettingsRoutes()`.

**Nuevo export en `@synkos/client`:** `useSettings` — composable que encapsula `useSettingsStore` + push notification state + `appLangs` computed.

`synkosSettingsRoutes()` sigue disponible en el paquete para usuarios que usan `createSynkosRouter` o prefieren las páginas por defecto sin personalizar.
