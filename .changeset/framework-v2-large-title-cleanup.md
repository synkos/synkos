---
'@synkos/client': patch
'@synkos/ui': minor
---

Framework v2 — large title colapsable + limpieza post-reorg

**@synkos/ui**

- `AppPageLargeTitle` ahora colapsa el título en el nav bar al hacer scroll — usa `IntersectionObserver` + `inject('synkos:set-nav-title')` inyectado por `MainLayout`. El nav bar hace crossfade entre el título de ruta y el título colapsado. Se limpia automáticamente en `onUnmounted`. Funciona con títulos dinámicos (actualiza si cambia el prop `title` mientras está colapsado).

**@synkos/client**

- `MainLayout` hace `provide('synkos:set-nav-title')` para el canal de comunicación con `AppPageLargeTitle`
- Nav bar title con transición `nav-title-fade` (crossfade posicionado absolutamente) para la animación de colapso
- `boot/index.ts` corregido — apuntaba a `./auth.js` eliminado tras la reorg, ahora `../auth/boot.js`
- `stores/index.ts` corregido — `./auth.store.js` → `../auth/store.js`
- `src/vue/layouts/` (vacío) eliminado
- Paths de tipos corregidos en `navigation/internal/tab-config.ts` y `navigation/router.ts`
