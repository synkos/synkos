---
'@synkos/client': minor
'create-synkos': patch
---

Framework v2 — Quasar-style layout routing

**Nuevo: patrón de rutas con layouts explícitos**

El usuario define la estructura de rutas completa igual que en Quasar/Vue Router puro. Los layouts son componentes que se usan en las rutas directamente:

```ts
import { MainLayout, AuthLayout, setupSynkosRouter, synkosSettingsRoutes } from '@synkos/client'

const router = createRouter({
  routes: [
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'login', name: 'auth-login', meta: { requiresAuth: false }, component: LoginPage },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          meta: { tab: { icon: 'home', labelKey: 'tabs.home', cache: true, componentName: 'HomePage' } },
          component: HomePage,
        },
        ...synkosSettingsRoutes(),          // profile + settings
      ],
    },
    {
      path: '/onboarding',
      component: OnboardingLayout,         // tu propio layout
      children: [...]
    },
  ],
})

setupSynkosRouter(router)                  // guards + tab discovery + drawer config

router.beforeEach((to) => { /* tus guards */ })
```

**Nuevas exports:**

- `MainLayout` — componente de layout principal (nav bar + tab bar)
- `AuthLayout` — componente de layout de auth
- `setupSynkosRouter(router, options?)` — wires guards, descubre tabs desde `meta.tab`, configura drawer
- `synkosSettingsRoutes(config?)` — devuelve las rutas de profile + settings listas para hacer spread
- `TabMeta` — tipo para `route.meta.tab`
- `SynkosSetupOptions` — opciones de `setupSynkosRouter`

**`meta.tab` — declarar tabs inline en la ruta:**

```ts
meta: {
  tab: {
    icon: 'home',
    labelKey: 'tabs.home',
    cache: true,
    componentName: 'HomePage',   // nombre del componente Vue para keep-alive
    badge: unreadCountRef,       // Ref<number> reactivo
  }
}
```

**`meta.requiresAuth: false`** — marca rutas públicas para el guard de `setupSynkosRouter`.

**`AppTabRoute`**: `component` ahora es opcional (nunca fue usado por MainLayout para renderizar).
**`AppTabRoute`**: nuevo campo `componentName?: string` para keep-alive explícito.

`createSynkosRouter` sigue funcionando sin cambios — ambas APIs son compatibles.
