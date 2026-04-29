---
title: Routing
description: Cómo encajan las páginas, las tabs, los layouts y los guards en Synkos.
order: 1
---

Synkos usa Vue Router con una pequeña capa encima: una sola llamada a `setupSynkosRouter` conecta el guard de auth, la tab bar y la nav bar dinámica. Tú declaras tu árbol de rutas como en cualquier app de Vue — Synkos simplemente se enchufa a él.

## Modelo mental

- **Los layouts** son componentes Vue que usas como `component` de una ruta padre. `MainLayout` renderiza una tab bar abajo; `AuthLayout` renderiza el chrome de auth.
- **Las tabs** se declaran en línea en las rutas vía `meta.tab`. `setupSynkosRouter` las descubre recorriendo `router.getRoutes()`.
- **El guard de auth** se registra automáticamente. Las rutas son `requiresAuth: true` por defecto a menos que `meta.requiresAuth` diga lo contrario.
- **Las rutas de settings** son un árbol de páginas (perfil, cuenta, notificaciones, etc.) que esparces en los hijos de tu `MainLayout` usando `synkosSettingsRoutes()`.

## La forma de un router de Synkos

```ts
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router';
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client';
import { settingsRoutes } from './settings.routes';

export default defineRouter(() => {
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          {
            path: 'login',
            name: 'auth-login',
            meta: { requiresAuth: false },
            component: () => import('src/pages/auth/LoginPage.vue'),
          },
        ],
      },
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '',
            name: 'home',
            meta: {
              tab: {
                icon: 'home',
                labelKey: 'tabs.home',
                cache: true,
                componentName: 'HomePage',
              },
            },
            component: () => import('src/features/home/pages/HomePage.vue'),
          },
          ...settingsRoutes,
        ],
      },
    ],
  });

  setupSynkosRouter(router);
  return router;
});
```

## Declarar tabs

Las tabs no son un paso de registro aparte. Añade `meta.tab` a cualquier ruta bajo `MainLayout` y Synkos la descubre.

```ts
{
  path: '/discover',
  name: 'discover',
  meta: {
    tab: {
      icon: 'compass',
      labelKey: 'tabs.discover',  // clave i18n
      cache: true,                 // mantener la instancia <KeepAlive>
      componentName: 'DiscoverPage',
    },
  },
  component: () => import('src/features/discover/pages/DiscoverPage.vue'),
}
```

| Campo           | Tipo      | Descripción                                                                           |
| --------------- | --------- | ------------------------------------------------------------------------------------- |
| `icon`          | `string`  | Nombre del icono del registro de `@synkos/ui`                                         |
| `labelKey`      | `string`  | Clave i18n para el label de la tab                                                    |
| `cache`         | `boolean` | Envuelve el componente de la ruta en `<KeepAlive>`                                    |
| `componentName` | `string`  | El `name` del componente que `<KeepAlive>` usa para identificar la instancia cacheada |

## Guard de autenticación

`setupSynkosRouter` registra un guard `beforeEach` que comprueba `to.meta.requiresAuth`:

- `requiresAuth: false` — ruta pública. Las páginas de auth (`/auth/login`, etc.) **deben** ponerlo así.
- `requiresAuth: true` (o sin definir) — requiere sesión. Los usuarios no autenticados se redirigen a `/auth/login`.

Puedes apilar tus propios guards encima:

```ts
const router = createRouter({ ... })
setupSynkosRouter(router)

router.beforeEach((to, from) => {
  // Tu guard se ejecuta DESPUÉS del guard de auth de Synkos.
  if (to.meta.requiresOnboarding && !user.hasCompletedOnboarding) {
    return { name: 'onboarding' }
  }
})
```

## Árbol de settings

El árbol de settings tiene criterio pero es customizable. `synkosSettingsRoutes()` devuelve el árbol por defecto (perfil, cuenta, preferencias, notificaciones, seguridad, billing, support, legal, about):

```ts
// src/router/settings.routes.ts
import { synkosSettingsRoutes } from '@synkos/client';

export const settingsRoutes = synkosSettingsRoutes({
  // sobreescribir secciones individuales pasando componentes propios
  billing: { component: () => import('src/pages/settings/billing/MyBilling.vue') },
});
```

O puedes esparcirlo en línea y añadir secciones custom en el mismo array de hijos:

```ts
{
  path: '/',
  component: MainLayout,
  children: [
    ...synkosSettingsRoutes(),
    {
      path: 'workspace',
      component: () => import('src/pages/WorkspacePage.vue'),
    },
  ],
}
```

## Layouts custom

No estás limitado a `MainLayout` y `AuthLayout`. Cualquier layout adicional es un componente Vue normal que usas como `component` de una ruta padre:

```ts
{
  path: '/onboarding',
  component: () => import('src/layouts/OnboardingLayout.vue'),
  children: [
    { path: 'welcome', component: () => import('src/pages/onboarding/Welcome.vue') },
    { path: 'permissions', component: () => import('src/pages/onboarding/Permissions.vue') },
  ],
}
```

Los layouts custom se renderizan sin tab bar — útiles para flujos a pantalla completa.

## Nav bar dinámica

Usa los composables de navegación dentro de cualquier página renderizada bajo `MainLayout` para mutar la nav bar:

```ts
import { useNavTitle, useNavAction } from '@synkos/client';

useNavTitle('Inbox (12)');

useNavAction({
  icon: 'plus',
  onClick: () => openCompose(),
});
```

Ambos se limpian solos cuando el componente se desmonta, así que navegar entre páginas funciona sin más.

## Dos APIs de router

Synkos expone dos factories:

- **`setupSynkosRouter(router, options?)`** — Estilo Quasar. Tú llamas a `createRouter` y le pasas el resultado. Recomendado.
- **`createSynkosRouter(options)`** — Todo en uno. Synkos llama a `createRouter` por ti dadas las configuraciones de rutas. Más simple, menos flexible.

La API estilo Quasar te da control total sobre `history`, `linkActiveClass`, `scrollBehavior` y tus propios hooks `beforeEach`. Prefiérela.

## Patrones comunes

### Navegación programática

```ts
import { useRouter } from 'vue-router';
const router = useRouter();
router.push({ name: 'profile', params: { id: '42' } });
```

### Leer parámetros de ruta

```ts
import { useRoute } from 'vue-router';
const route = useRoute();
const id = computed(() => route.params.id as string);
```

### Redirigir desde una página

```ts
const router = useRouter();
onMounted(() => {
  if (!hasRequiredData) router.replace({ name: 'home' });
});
```

## Siguientes pasos

- [Autenticación](/docs/guide/auth) — cómo el guard de auth sabe que estás logueado
- [Theming](/docs/guide/theming) — qué usan `MainLayout` y `AuthLayout` por dentro
