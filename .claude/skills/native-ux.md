# Skill: Native UX

> **Scope**: `apps/frontend/` y `packages/synkos-ui/`. Aplica cuando se crea o modifica cualquier componente visual o interacción de usuario.

## Filosofía

La app debe sentirse **nativa** en iOS y en Android. El usuario no debe notar que es una web app. Esto significa seguir los patrones de interacción, animación y visual de cada plataforma — no inventar un lenguaje propio ni usar patrones de web.

---

## Patrones por plataforma

### iOS

**Navegación**
- Título grande en la parte superior que colapsa en el nav bar al hacer scroll (`AppPageLargeTitle`)
- Nav bar translúcida con efecto blur al hacer scroll sobre contenido
- Swipe desde el borde izquierdo para volver (manejado por el router — no bloquear)
- Tab bar fijo en la parte inferior con padding de safe area

**Presentaciones modales**
- Bottom sheets con drag handle visible, spring animation, posibilidad de snap points
- Dismiss con swipe hacia abajo o tap fuera
- Usar `AppBottomSheet` + `useSheetDrag()` para physics correctas

**Interacción**
- Haptics en acciones significativas: light feedback en tap, heavy en acciones destructivas
- Sin efecto ripple (es Android) — el feedback es inmediato + opacidad o escala
- Long press para context menus o acciones secundarias

**Visual**
- Border radius generoso: 12-16px en cards y sheets
- Separadores de lista sutiles (1px, color semitransparente)
- Disclosure chevron (`›`) en filas de lista que navegan a otra pantalla
- Sistema de colores semánticos (no hardcodear azul Apple — usar `var(--color-primary)`)

---

### Android

**Navegación**
- Back gesture desde cualquier borde (manejado por Capacitor — no bloquear)
- No usar large title pattern — el título es inline en la app bar, tamaño normal
- Tab bar puede estar en la parte inferior o top, según el diseño

**Interacción**
- Ripple effect en elementos interactivos (implementar con CSS o Capacitor Ripple)
- Haptics: disponibles pero con intensidad diferente a iOS — usar `Capacitor Haptics` correctamente

**Visual**
- Border radius más moderado (8-12px) que iOS en general
- Elevación leve en lugar de bordes para separar superficies
- Sin disclosure chevrons en listas (no es convención Android)

---

## Implementación en código

### Diferencias por plataforma

En CSS, usar `data-platform` (aplicado por `SynkosApp.vue`):
```css
/* Solo iOS */
[data-platform="ios"] .mi-componente {
  border-radius: 14px;
}

/* Solo Android */
[data-platform="android"] .mi-componente {
  border-radius: 8px;
}
```

En Vue, usar `usePlatform()` de `@synkos/client`:
```ts
const { isIOS, isAndroid, isNative } = usePlatform()
```

### Safe areas

Siempre respetar las safe areas del dispositivo:
```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

El layout de `MainLayout` ya gestiona las safe areas del nav bar y tab bar. En páginas custom (OnboardingLayout, etc.) aplicarlas manualmente.

---

## Anti-patrones web a evitar

Estos patrones son correctos en web pero **rompen el feel nativo**:

| Evitar | Por qué | Alternativa |
|--------|---------|-------------|
| `:hover` en CSS | No hay hover en móvil | `:active` + escala/opacidad |
| `cursor: pointer` | No hay cursor en móvil | Eliminar |
| `<select>` nativo | Feísimo en móvil | Componente custom o bottom sheet |
| `window.alert()` / `window.confirm()` | Diálogos de browser | Bottom sheet con acciones |
| Scrollbar visible | No existe en apps nativas | `overflow: hidden` o CSS para ocultar |
| Paginación con botones Siguiente/Anterior | No es nativo | Infinite scroll o pull-to-refresh |
| Tooltips al hover | Imposible en touch | Inline help text o long press |
| Transiciones `ease` o `linear` genéricas | Sensación de web | Spring physics para iOS, material para Android |
| Touch target < 44pt/44dp | Imposible de pulsar | Mínimo 44×44px de área interactiva |
| Outline de focus visible | Solo relevante en web con teclado | Ocultar en modo nativo |

---

## Animaciones y transiciones

- **iOS**: spring physics (no `ease-in-out`). `cubic-bezier(0.25, 0.46, 0.45, 0.94)` como aproximación CSS.
- **Android**: material motion. Duración 200-300ms, `cubic-bezier(0.4, 0, 0.2, 1)`.
- Usar las variables de transición de `platform.scss` en lugar de definir las tuyas.
- Las transiciones de ruta/página las gestiona `MainLayout` — no añadir transiciones duplicadas.

---

## Checklist

- [ ] Sin `:hover` en estilos de componentes táctiles
- [ ] Sin `cursor: pointer` en elementos de la app
- [ ] Diferencias iOS/Android implementadas via `data-platform` o `usePlatform()`, no hardcodeadas
- [ ] Safe areas respetadas en layouts custom
- [ ] Touch targets mínimo 44×44px
- [ ] Animaciones usan las curvas de `platform.scss`, no valores genéricos
- [ ] Bottom sheets usan `AppBottomSheet` + `useSheetDrag()` (no `QDialog`)
- [ ] Sin componentes Quasar (`Q*`) en el código
- [ ] Disclosure chevron presente en filas iOS que navegan (ausente en Android)
