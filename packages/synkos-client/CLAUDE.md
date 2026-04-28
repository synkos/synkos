# @synkos/client — Convenciones internas

> Cargado automáticamente cuando trabajas en `packages/synkos-client/`. Complementa el CLAUDE.md raíz.

## Estructura de dominios

Cada dominio tiene su carpeta. No mezclar lógica entre dominios sin pasar por composables exportados.

```
src/
├── auth/         ← sesión, usuario, biometría, social login, OTP
│   ├── store.ts  ← useAuthStore (Pinia)
│   ├── boot.ts   ← createAuthBoot
│   └── services/ ← AuthService, UserService, AccountService, UsernameService
├── navigation/   ← router factory, layouts, tab config
│   ├── router.ts ← createSynkosRouter + setupSynkosRouter + synkosSettingsRoutes
│   ├── layouts/  ← MainLayout.vue + AuthLayout.vue (son API público — cambios = breaking)
│   └── composables/ ← useNavAction, useNavTitle
├── boot/         ← synkos.ts (boot principal) + factories individuales
├── composables/  ← composables generales (usePlatform, useTheme, useSignOut...)
├── stores/       ← useSettingsStore
├── api/          ← axios client con token injection y retry 401
├── internal/     ← singletons NO exportados (app-config, i18n-bridge)
├── i18n/         ← en-US + es-ES core strings del framework
├── vue/
│   ├── SynkosApp.vue      ← root component (exportado)
│   ├── components/        ← AppMenuDrawer, DeletionBanner, SplashOverlay, LegalBottomSheet
│   └── pages/             ← FALLBACK PAGES — ver nota crítica abajo
└── index.ts      ← ÚNICA fuente de verdad del API público
```

---

## Nota crítica: `vue/pages/`

Las páginas en `src/vue/pages/` son **fallback pages** — solo se usan si el usuario no define las suyas en su router. **No añadir lógica de negocio aquí que no esté también en un composable exportado.** Si el usuario sobreescribe la página, perdería esa lógica.

Regla: cualquier lógica en una fallback page debe existir como composable exportado en `src/composables/` o en el store correspondiente.

---

## Reglas de API público

- `src/index.ts` es la única fuente del API público. Si no está ahí, es interno.
- `src/internal/` nunca se exporta. Son singletons del framework.
- `MainLayout` y `AuthLayout` son API público — cualquier cambio en su estructura de slots es un breaking change.
- Cuando cambias la firma de un composable exportado, actualizar todos los consumidores en `apps/frontend`.

---

## Añadir un composable

1. Determinar dominio: ¿es específico de auth/navigation? → carpeta del dominio. ¿General? → `src/composables/`
2. Crear el archivo siguiendo el patrón de retorno existente: `return { prop, method }` (sin clases)
3. Exportar desde `src/index.ts`

---

## Añadir al boot

- Siempre necesario en toda app → añadir en `src/boot/synkos.ts`
- Opcional / configurable → crear `src/boot/<nombre>.ts` como factory y exportarlo desde `index.ts`

---

## Añadir un store

1. Crear en `src/stores/<nombre>.ts` con `defineStore`
2. Exportar desde `src/index.ts`
3. No importar stores entre sí directamente — comunicar via composables

---

## i18n del paquete

Las keys del framework deben estar en `src/i18n/en-US/` y `es-ES/`. El usuario puede sobreescribir estas keys en su propio i18n. No hardcodear strings visibles al usuario en ningún componente del paquete.

---

## Changesets

- Cualquier cambio en `index.ts` (add/remove/rename export) → `minor` o `major`
- Cambio de comportamiento en `useAuthStore`, `useSettingsStore`, layouts → evaluar `minor` o `major`
- Bug fix sin cambio de API → `patch`
