---
title: Capacitor
description: Plugins nativos, detección de plataforma y cómo añadir capacidades nativas.
order: 5
---

Capacitor es el puente entre tu app Vue y el iOS/Android nativo. Synkos selecciona un set pequeño de plugins y los preconfigura para que las necesidades comunes (haptics, biometría, push, splash, login social, cámara, preferences) funcionen out of the box.

## Lo que viene en un proyecto Synkos

Un proyecto recién creado incluye estos plugins de Capacitor, ya configurados:

| Plugin                              | Para qué sirve                                            |
| ----------------------------------- | --------------------------------------------------------- |
| `@capacitor/app`                    | Eventos de estado de app (active, paused, manejo de URLs) |
| `@capacitor/haptics`                | Feedback táctil para UI nativa                            |
| `@capacitor/preferences`            | Almacenamiento clave-valor (usado para tokens, settings)  |
| `@capacitor/push-notifications`     | Token de push + handling de entrega                       |
| `@capacitor/splash-screen`          | Control nativo del splash                                 |
| `@capgo/camera-preview`             | Viewfinder de cámara                                      |
| `@capgo/capacitor-native-biometric` | Face ID / Touch ID / huella                               |
| `@capgo/capacitor-social-login`     | Login con Google + Apple                                  |

Vienen pre-instalados y pre-importados en `quasar.config.ts` bajo `optimizeDeps.include` — eso es importante para el modo dev (más sobre esto abajo).

## Detectar la plataforma

Usa siempre `usePlatform()` en lugar de `Capacitor.getPlatform()` directamente. Es reactivo, tipado y consistente con el resto del framework:

```ts
import { usePlatform } from '@synkos/client';

const { isIOS, isAndroid, isNative, isWeb, platform } = usePlatform();

if (isNative.value) {
  // corriendo dentro de un shell nativo
}
```

| Propiedad   | Tipo                          | Descripción                |
| ----------- | ----------------------------- | -------------------------- |
| `platform`  | `'ios' \| 'android' \| 'web'` | Nombre crudo de plataforma |
| `isIOS`     | `Ref<boolean>`                | True en iOS                |
| `isAndroid` | `Ref<boolean>`                | True en Android            |
| `isNative`  | `Ref<boolean>`                | True en iOS o Android      |
| `isWeb`     | `Ref<boolean>`                | True en navegador (PWA)    |

## Llamar APIs nativas

### La regla de oro

**Nunca llames APIs de Capacitor en el top-level de tu `<script setup>`.** Pueden ejecutarse en web donde el plugin no existe, o en el servidor durante SSR (si algún día lo añades). Envuelve siempre en `onMounted`, un event handler, o protege con `isNative`:

```ts
import { onMounted } from 'vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { usePlatform } from '@synkos/client';

const { isNative } = usePlatform();

async function onTap() {
  if (isNative.value) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}
```

### Fallbacks de web

Para features que tienen equivalente en web, escribe un wrapper pequeño:

```ts
async function pickPhoto(): Promise<string | null> {
  if (isNative.value) {
    const { Camera } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({ resultType: 'uri', quality: 80 });
    return photo.webPath ?? null;
  }
  return await pickFromFileInput();
}
```

Esto mantiene limpio el call site: `const photo = await pickPhoto()`.

## Añadir un plugin nuevo

Tres pasos:

### 1. Instalar el paquete

```bash
pnpm add @capacitor/geolocation
```

### 2. Añadirlo a `optimizeDeps.include`

Abre `apps/frontend/quasar.config.ts` y añade el paquete a `vitePluginOptions.viteVuePluginOptions.optimizeDeps.include`:

```ts
build: {
  vitePluginOptions: {
    optimizeDeps: {
      include: [
        '@capacitor/app',
        '@capacitor/geolocation',  // ← añadir esto
        // ...
      ],
    },
  },
},
```

Esto es **importante**. Sin ello, Vite descubre el plugin en la primera navegación y dispara un hot reload — visible como un flash blanco. El pre-bundling hace la experiencia suave.

### 3. Sincronizar proyectos nativos

```bash
pnpm sync:ios
# o
pnpm sync:android
```

Esto llama a `cap sync` de Capacitor y copia las piezas nativas del plugin a los proyectos iOS/Android.

## Permisos

Los permisos son del SO. El patrón es consistente entre plugins:

```ts
import { PushNotifications } from '@capacitor/push-notifications';

const status = await PushNotifications.checkPermissions();
if (status.receive !== 'granted') {
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') {
    // el usuario denegó — muestra un link a settings
    return;
  }
}
await PushNotifications.register();
```

No pidas un permiso hasta que el usuario esté en el contexto adecuado. Pedir acceso a la cámara al arrancar la app es un desastre de UX. Espera a que el usuario pulse "Tomar foto".

## Eventos de estado de la app

Escucha `pause`, `resume` y eventos de URL con `@capacitor/app`:

```ts
import { App } from '@capacitor/app';

onMounted(async () => {
  const handle = await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) refreshData();
  });
  onBeforeUnmount(() => handle.remove());
});
```

Para deep links, escucha `appUrlOpen` y enruta a la página correspondiente en tu router.

## Patrones comunes

### Feedback háptico en taps

```ts
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { usePlatform } from '@synkos/client';
import { useSettingsStore } from '@synkos/client';

const { isNative } = usePlatform();
const settings = useSettingsStore();

async function tap() {
  if (isNative.value && settings.haptics) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
}
```

El flag `useSettingsStore().haptics` permite a los usuarios desactivar haptics globalmente.

### Leer un valor almacenado

```ts
import { Preferences } from '@capacitor/preferences';

const { value } = await Preferences.get({ key: 'lastSeenAnnouncement' });
```

`@capacitor/preferences` funciona también en web (respaldado por `localStorage`). Úsalo para cualquier persistencia clave-valor pequeña.

### Detectar si la app se lanzó desde una notificación

```ts
PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  if (action.notification.data.deeplink) {
    router.push(action.notification.data.deeplink);
  }
});
```

## Anti-patrones

**No uses `Capacitor.isPluginAvailable()`.** Es frágil. Usa `isNative.value` y dynamic imports.

**No pre-importes todos los plugins en el top de `main.ts`.** Los plugins son pesados. Lazy-loadéalos donde se usen.

**No escribas branches de plataforma en código de feature.** Envuelve el branch de plataforma en un composable pequeño (`useCamera`, `useShare`) y usa el composable.

## Siguientes pasos

- [Autenticación](/docs/guide/auth) — cómo el flujo de auth usa los plugins de biometría y social
- [Despliegue](/docs/guide/deployment) — construir binarios firmados de iOS y Android
