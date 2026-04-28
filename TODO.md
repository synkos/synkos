# TODO

## Framework — pending

- [ ] Tests individuales para cada paquete (`@synkos/client`, `@synkos/ui`, `synkos`)
- [ ] Typed `theme.config.ts` — sistema de tokens de branding con tipos y autocompletado
- [ ] Soporte Android completo — aplicar `[data-platform="android"]` en componentes (`MainLayout`, `AppButton` ripple, back gesture)
- [ ] Independencia total de `@synkos/ui` de Quasar — los componentes actuales asumen que Quasar está instalado. Migrar a Vue nativo puro.
- [ ] Props de personalización en componentes de `@synkos/ui` (color de fondo, borde, texto) para encajar con el sistema de diseño avanzado
- [ ] AVANZADO: Sistema debuggeable — prop `debug` en componentes que muestra estado en hover/click

## Frontend template — pending

- [ ] Eliminar archivos innecesarios del template (apps/playground, referencias a TGC, etc.)
- [ ] Ejemplo de 3 tabs en el template (actualmente solo tiene home + profile)

## @synkos/client — pending

- [ ] `AppMenuDrawer` debería soportar inyección de secciones custom además de las built-in

---

## Completado ✅

### Framework v2 (Auth, routing, navegación, settings)

- [x] Auth pages en el template — `src/pages/auth/LoginPage.vue` + `UsernamePage.vue` completamente editables
- [x] Todos los colores de auth usan CSS custom properties (`--auth-bg`, `--auth-text-primary`, etc.)
- [x] Settings pages en el template — `src/pages/settings/` (18 páginas editables incluyendo billing, legal, etc.)
- [x] `src/router/settings.routes.ts` — rutas explícitas y editables
- [x] Quasar-style routing — `setupSynkosRouter` + `MainLayout` + `AuthLayout` exportados como componentes
- [x] `meta.tab` — declarar tabs inline en rutas
- [x] `synkosSettingsRoutes(config?)` — helper que devuelve rutas de settings
- [x] Sistema de N tabs (era hardcodeado a 2)
- [x] Badges reactivos en tabs (`meta.tab.badge: Ref<number>`)
- [x] Keep-alive por tab (`meta.tab.cache: true`)
- [x] `hideTabBar` route meta
- [x] `useNavAction({ icon, onClick })` — inyectar acción en nav bar desde páginas
- [x] `useNavTitle(title)` — título dinámico en nav bar desde páginas
- [x] `usePlatform()` — `{ isIOS, isAndroid, isNative, isWeb }` + `data-platform` en `<html>`
- [x] `AppPageLargeTitle` — colapsa en nav bar con IntersectionObserver (patrón iOS)
- [x] CSS custom properties en auth (`--auth-bg`, etc.) y sistema de temas dark/light
- [x] `platform.scss` — tokens `--nav-bar-height`, `--tab-bar-height`, curvas de animación por plataforma
- [x] Reorganización interna `src/auth/` + `src/navigation/` en `@synkos/client`
- [x] Boot respeta `features.faceId` y `features.pushNotifications`
- [x] `SynkosApp.vue` — transiciones de auth por path `/auth` (no nombre de ruta hardcodeado)
- [x] Ejemplo de layout custom `OnboardingLayout.vue`
- [x] `quasar.config.ts` — `optimizeDeps` correcto para workspace packages y Capacitor

### @synkos/ui

- [x] `useBottomSheet()` + `useDrawer()` — composables headless
- [x] `AppPageLargeTitle` — conectado al sistema de nav title

### Tema

- [x] `dark.theme.scss` + `light.theme.scss` — CSS custom properties para ambos temas
- [x] Cambio de tema reactivo desde Settings → Preferences
