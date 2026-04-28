# @synkos/ui — Convenciones de componentes

> Cargado automáticamente cuando trabajas en `packages/synkos-ui/`. Complementa el CLAUDE.md raíz.

## Filosofía

@synkos/ui es el **reemplazo completo de los componentes UI de Quasar** en el ecosistema Synkos. El proyecto usa Quasar solo como tooling de build — nunca sus componentes. Cuando `apps/frontend` necesita un componente que no existe aquí, **se crea en este paquete**, no se recurre a Quasar.

Cada componente debe:

- Tener look-and-feel **nativo** para iOS y Android (ver skill `native-ux`)
- Ser agnóstico de dominio (sin lógica de auth, settings, stores)
- Usar el sistema de diseño (CSS custom properties del tema)
- Adaptar su comportamiento y apariencia a la plataforma via `data-platform`

---

## Estructura del paquete

```
src/
├── components/
│   ├── actions/     ← AppButton
│   ├── display/     ← componentes de display
│   ├── feedback/    ← AppSpinner, AppCircularProgress, AppEmptyState
│   ├── forms/       ← SegmentControl
│   ├── layout/      ← AppPage, AppPageLargeTitle
│   ├── lists/       ← AppListRow, AppListSection, AppListDivider
│   ├── media/       ← AppIcon
│   ├── navigation/  ← componentes de navegación
│   └── overlays/    ← AppBottomSheet, AppDrawer
├── composables/
│   ├── useBottomSheet.ts
│   ├── useDrawer.ts
│   └── useSheetDrag.ts
├── icons/           ← sistema de iconos (getIcon, icons)
└── index.ts         ← ÚNICA fuente del API público
```

---

## Reglas de implementación

- Siempre `<script setup lang="ts">` — nunca Options API
- Props con tipos explícitos TypeScript (sin `any`)
- Emits declarados con `defineEmits<{ ... }>()`
- **Slots sobre props complejas**: contenido variable → slot, no prop de string o VNode
- Estilos: CSS custom properties del tema (`var(--color-primary)`, `var(--surface-*)`) — sin colores hardcodeados
- Espaciado: variables de `quasar.variables.scss` — sin px hardcodeados para spacing
- No importar desde `@synkos/client` — @synkos/ui no depende del runtime del framework

---

## Antes de crear un componente nuevo

1. Verificar que no existe uno similar en `src/components/`
2. Si existe: extender con props opcionales en lugar de duplicar
3. Determinar la categoría correcta (actions / feedback / forms / layout / lists / media / overlays)
4. Probar en `apps/frontend` antes de dar por válido

---

## Añadir un componente

1. Crear `src/components/<categoria>/<NombreComponente>.vue`
2. Exportar desde `src/index.ts` bajo el comentario de categoría correspondiente
3. Si necesita composable propio: crear en `src/composables/use<Nombre>.ts` y exportar desde `index.ts`

---

## Changesets

- Nuevo componente → `minor`
- Bug fix de comportamiento visible → `patch`
- Cambio de API (props/emits/slots breaking) → `major`
- Cambio solo interno de estilos → `patch`
