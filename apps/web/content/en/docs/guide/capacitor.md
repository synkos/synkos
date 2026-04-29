---
title: Capacitor
description: Native plugins, platform detection and how to add native capabilities.
order: 5
---

Capacitor is the bridge between your Vue app and native iOS/Android. Synkos curates a small set of plugins and pre-configures them so the common needs (haptics, biometric, push, splash, social login, camera, preferences) work out of the box.

## What ships with a Synkos project

A fresh project includes these Capacitor plugins, already configured:

| Plugin                              | What it does                                    |
| ----------------------------------- | ----------------------------------------------- |
| `@capacitor/app`                    | App state events (active, paused, URL handling) |
| `@capacitor/haptics`                | Touch feedback for native UI                    |
| `@capacitor/preferences`            | Key-value storage (used for tokens, settings)   |
| `@capacitor/push-notifications`     | Push token + delivery handling                  |
| `@capacitor/splash-screen`          | Native splash control                           |
| `@capgo/camera-preview`             | Camera viewfinder                               |
| `@capgo/capacitor-native-biometric` | Face ID / Touch ID / fingerprint                |
| `@capgo/capacitor-social-login`     | Google + Apple sign-in                          |

These come pre-installed and pre-imported in `quasar.config.ts` under `optimizeDeps.include` — that's important for dev mode (more on that below).

## Detecting the platform

Always use `usePlatform()` instead of `Capacitor.getPlatform()` directly. It's reactive, typed, and consistent with the rest of the framework:

```ts
import { usePlatform } from '@synkos/client';

const { isIOS, isAndroid, isNative, isWeb, platform } = usePlatform();

if (isNative.value) {
  // running inside a native shell
}
```

| Property    | Type                          | Description               |
| ----------- | ----------------------------- | ------------------------- |
| `platform`  | `'ios' \| 'android' \| 'web'` | Raw platform name         |
| `isIOS`     | `Ref<boolean>`                | True on iOS               |
| `isAndroid` | `Ref<boolean>`                | True on Android           |
| `isNative`  | `Ref<boolean>`                | True on iOS or Android    |
| `isWeb`     | `Ref<boolean>`                | True in the browser (PWA) |

## Calling native APIs

### The golden rule

**Never call Capacitor APIs at the top level of your `<script setup>` block.** They might run on web where the plugin isn't available, or on the server during SSR (if you ever add it). Always wrap in `onMounted`, an event handler, or guard with `isNative`:

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

### Web fallbacks

For features that have a web equivalent, write a small wrapper:

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

This keeps the call site clean: `const photo = await pickPhoto()`.

## Adding a new plugin

Three steps:

### 1. Install the package

```bash
pnpm add @capacitor/geolocation
```

### 2. Add it to `optimizeDeps.include`

Open `apps/frontend/quasar.config.ts` and add the package to `vitePluginOptions.viteVuePluginOptions.optimizeDeps.include`:

```ts
build: {
  vitePluginOptions: {
    optimizeDeps: {
      include: [
        '@capacitor/app',
        '@capacitor/geolocation',  // ← add this
        // ...
      ],
    },
  },
},
```

This is **important**. Without it, Vite discovers the plugin on first navigation and triggers a hot reload — visible as a white flash. Pre-bundling makes the experience smooth.

### 3. Sync native projects

```bash
pnpm sync:ios
# or
pnpm sync:android
```

This calls Capacitor's `cap sync` and copies the native pieces of the plugin into the iOS/Android projects.

## Permissions

Permissions belong to the OS. The pattern is consistent across plugins:

```ts
import { PushNotifications } from '@capacitor/push-notifications';

const status = await PushNotifications.checkPermissions();
if (status.receive !== 'granted') {
  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== 'granted') {
    // user denied — show a settings link instead
    return;
  }
}
await PushNotifications.register();
```

Don't request a permission until the user is in the right context. Asking for camera access on app start is a UX disaster. Wait for the user to tap "Take photo".

## App state events

Listen for `pause`, `resume` and URL events with `@capacitor/app`:

```ts
import { App } from '@capacitor/app';

onMounted(async () => {
  const handle = await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) refreshData();
  });
  onBeforeUnmount(() => handle.remove());
});
```

For deep links, listen to `appUrlOpen` and route to the matching page in your router.

## Common patterns

### Haptic feedback on taps

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

The `useSettingsStore().haptics` flag lets users disable haptics globally.

### Reading a stored value

```ts
import { Preferences } from '@capacitor/preferences';

const { value } = await Preferences.get({ key: 'lastSeenAnnouncement' });
```

`@capacitor/preferences` works on web too (backed by `localStorage`). Use it for any small key-value persistence.

### Detecting if the app is launched from a notification

```ts
PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  if (action.notification.data.deeplink) {
    router.push(action.notification.data.deeplink);
  }
});
```

## Anti-patterns

**Don't use `Capacitor.isPluginAvailable()`.** It's brittle. Use `isNative.value` and dynamic imports instead.

**Don't pre-import every plugin at the top of `main.ts`.** Plugins are heavy. Lazy-load them where they're used.

**Don't write platform branches in feature code.** Wrap the platform branch in a small composable (`useCamera`, `useShare`) and use the composable.

## Next steps

- [Authentication](/docs/guide/auth) — how the auth flow uses biometric and social plugins
- [Deployment](/docs/guide/deployment) — building signed iOS and Android binaries
