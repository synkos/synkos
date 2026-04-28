---
'@synkos/client': minor
'@synkos/ui': patch
'create-synkos': patch
---

Framework v2 — gaps completados + reorganización interna src/auth/ y src/navigation/

**@synkos/client — correcciones funcionales**

- `SynkosApp.vue`: transiciones de auth ahora detectan por path `/auth` en lugar del nombre de ruta hardcodeado `'auth-login'` — compatible con `authRoutes` personalizado
- Boot: respeta `config.features.pushNotifications === false` para saltarse la inicialización de notificaciones
- Auth store: respeta `config.features.faceId === false` para saltarse la promesa biométrica aunque el usuario la tuviera activada
- `useNavTitle(title)` — nuevo composable que inyecta un título dinámico en el nav bar desde cualquier página; tiene prioridad sobre `route.meta.titleKey`; limpia automáticamente en `onUnmounted`

**@synkos/client — plataforma**

- Platform tokens en `platform.scss` con variables CSS para nav-bar-height, tab-bar-height y curvas de animación por plataforma (`[data-platform="ios"]` / `[data-platform="android"]`)
- MainLayout usa `var(--nav-content-size)`, `var(--tab-bar-height)` y `var(--platform-transition-push)` en lugar de valores hardcodeados iOS

**@synkos/client — reorganización interna (no breaking)**

- `src/auth/` — auth store, auth/account/user/username services, auth boot
- `src/navigation/` — router factory, layouts, nav composables (useNavAction, useNavTitle), nav internals (tab-config, nav-state, settings-config)
- Todos los exports públicos en `index.ts` se mantienen idénticos — zero breaking changes para consumers

**create-synkos**

- Template incluye `src/css/platform.scss` con tokens iOS/Android listos para personalizar
