# Frontend — Convenciones de desarrollo

> Cargado automáticamente cuando trabajas en `apps/frontend/`. Complementa el CLAUDE.md raíz.

## Stack

- Vue 3 + `<script setup lang="ts">` — siempre, nunca Options API
- Quasar Framework — **solo como tooling** (CLI, build, bundler, hot-reload). Sus componentes UI nunca se usan.
- @synkos/ui — **única librería de componentes UI**. Si no existe lo que necesitas, créalo aquí.
- @synkos/client (lógica del framework: stores, composables, layouts, router)
- Pinia (vía @synkos/client — no crear stores propios salvo necesidad específica)
- vue-i18n (todos los strings visibles al usuario)
- Capacitor (funcionalidades nativas)

---

## Componentes

### Regla absoluta: nunca usar componentes Quasar

**Prohibido** usar tags `Q*` (`QBtn`, `QInput`, `QDialog`, `QPage`...) o importar componentes desde `'quasar'` en archivos `.vue`. Quasar es solo el bundler — no su librería de UI.

**Si necesitas algo que @synkos/ui no tiene → créalo en `packages/synkos-ui/`, no uses Quasar.**

Esto aplica durante la transición y seguirá aplicando cuando el proyecto sea independiente de Quasar del todo.

### Usa @synkos/ui siempre

```
AppButton         ← acciones de usuario
AppPage           ← wrapper de página
AppListRow        ← fila de lista
AppListSection    ← sección de lista
AppListDivider    ← separador de lista
AppIcon           ← iconos
AppBottomSheet    ← sheets modales (+ useBottomSheet())
AppDrawer         ← menús laterales (+ useDrawer())
AppSpinner        ← loading states
AppEmptyState     ← estados vacíos
AppPageLargeTitle ← título grande con colapso en scroll (patrón iOS)
SegmentControl    ← selector segmentado
```

### Estructura de componentes propios

- Reutilizable cross-feature → `src/components/<NombreComponente>.vue`
- Específico de una feature → `src/features/<feature>/components/<Nombre>.vue`
- Componente genérico de UI → añadirlo en `packages/synkos-ui/`

---

## Strings e i18n

- **Nunca** hardcodear strings visibles al usuario
- Usar `const { t } = useI18n()` en `<script setup>`
- Añadir la key en `src/i18n/en-US/index.ts` y `src/i18n/es-ES/index.ts`
- Formato de keys: namespace + camelCase → `'settings.account.changePassword'`

---

## Estado y stores

- No crear stores de Pinia propios en `apps/frontend/` salvo que sea lógica totalmente ajena al framework
- Stores disponibles via `@synkos/client`:
  - `useAuthStore()` — sesión, usuario, biometría
  - `useSettingsStore()` — tema, idioma, haptics, push notifications
- Estado local de componente: `ref()` / `reactive()` en `<script setup>`
- Estado compartido entre componentes de una feature: composable local en `src/features/<feature>/composables/`

---

## Estilos y tema

- **Sin colores hardcodeados** — usar siempre CSS custom properties: `var(--color-primary)`, `var(--auth-bg)`, etc.
- Variables SCSS de `quasar.variables.scss` disponibles en `<style lang="scss">` de cualquier SFC
- Lógica condicional de plataforma **en CSS**: usar `[data-platform="ios"] .clase { }` en lugar de clases dinámicas
- Lógica condicional de plataforma **en JS**: usar `const { isIOS, isNative } = usePlatform()` de `@synkos/client`
- No modificar `dark.theme.scss` / `light.theme.scss` directamente — son parte del template del usuario

---

## Routing y navegación

- **Tabs**: declarar en `meta.tab` de la ruta con `{ icon, labelKey, cache, componentName }`
- `setupSynkosRouter(router)` ya registra guards de auth — no duplicar la lógica
- Layouts exportados desde `@synkos/client`: `MainLayout` (con tab bar), `AuthLayout` (sin tab bar)
- Settings pages: definir en `src/router/settings.routes.ts`, importar en el router
- Título dinámico de la nav bar: `useNavTitle(title)` desde `@synkos/client`
- Acción de trailing en nav bar: `useNavAction({ icon, onClick })` desde `@synkos/client`

---

## Capacitor / nativo

- Detectar plataforma: `usePlatform()` de `@synkos/client` — no usar `Capacitor.getPlatform()` directamente
- Nuevos plugins de Capacitor:
  1. Instalar el paquete
  2. Añadir a `optimizeDeps.include` en `quasar.config.ts` (evita flash reload en dev)
- Código nativo siempre condicional: `if (isNative.value) { ... }`
- No llamar APIs de Capacitor en el top-level del script — siempre dentro de `onMounted` o event handlers
