---
title: Autenticación
description: Email + OTP, login social, biometría y gestión de cuenta.
order: 2
---

Synkos trae una capa de autenticación completa: un store de Pinia, un set de servicios, biometría, providers sociales y páginas editables para cada flujo. Esta guía explica las piezas y cómo conectarlas a tu backend.

## Lo que viene incluido

- Un store de sesión (`useAuthStore`) con `user`, `tokens` y métodos de ciclo de vida.
- Servicios HTTP (`AuthService`, `UserService`, `AccountService`, `UsernameService`).
- Biometría vía `@capgo/capacitor-native-biometric`.
- Login social vía `@capgo/capacitor-social-login` (Google, Apple).
- Cliente Axios consciente de 401 con refresco automático de token.
- Páginas editables propias del usuario para login, OTP, picker de username, hub de cuenta, cambio de contraseña, eliminación.

## Anatomía de una sesión

El store de auth mantiene la sesión en memoria y persiste los tokens en `@capacitor/preferences`:

```ts
import { useAuthStore } from '@synkos/client'

const auth = useAuthStore()

auth.user            // ref<PublicUser | null>
auth.isAuthenticated // computed: boolean
auth.signIn({ ... })
auth.signOut()
```

Los `Tokens` son un par access/refresh. El cliente Axios inyecta el access token en cada request y, cuando el servidor devuelve `401`, llama al endpoint de refresh, reintenta la petición original y propaga los fallos al caller.

## Contrato del backend

Synkos espera que tu backend exponga un set pequeño de endpoints REST. La forma es intencionalmente estrecha:

| Endpoint                     | Propósito                             | Método del servicio          |
| ---------------------------- | ------------------------------------- | ---------------------------- |
| `POST /auth/register`        | Crear cuenta con email + password     | `AuthService.register`       |
| `POST /auth/login`           | Login con email + password            | `AuthService.login`          |
| `POST /auth/refresh`         | Intercambiar refresh por nuevo access | `AuthService.refresh`        |
| `POST /auth/forgot-password` | Disparar reset email/OTP              | `AuthService.forgotPassword` |
| `POST /auth/reset-password`  | Confirmar reset con OTP               | `AuthService.resetPassword`  |
| `POST /auth/oauth/:provider` | Intercambiar token OAuth por sesión   | `AuthService.oauth`          |
| `GET /me`                    | Obtener usuario actual                | `UserService.me`             |
| `PATCH /me`                  | Actualizar perfil                     | `UserService.update`         |
| `DELETE /account`            | Borrar cuenta                         | `AccountService.delete`      |
| `POST /username/check`       | Validar disponibilidad                | `UsernameService.check`      |

Los tipos de los payloads (`RegisterDto`, `LoginDto`, `AuthResponse`, …) están exportados desde `@synkos/client`.

## Configuración

En `src/app.config.ts`, declara qué providers soportas y la URL base de la API:

```ts
import { defineAppConfig } from 'synkos';

export default defineAppConfig({
  identity: {
    name: 'My App',
    bundleId: 'com.myco.app',
  },
  api: {
    baseUrl: 'https://api.myco.app',
  },
  features: {
    socialLogin: ['google', 'apple'],
    biometric: true,
    pushNotifications: true,
  },
});
```

Para login social, mete los client IDs en `.env`:

```bash
VITE_GOOGLE_CLIENT_ID=...
VITE_APPLE_SERVICE_ID=...
```

## Flujos de login

### Email + password

```ts
const auth = useAuthStore();

async function onSubmit({ email, password }) {
  try {
    await auth.signIn({ email, password });
    router.push({ name: 'home' });
  } catch (err) {
    // err.code es 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'NETWORK'
    setError(err.message);
  }
}
```

### Email + OTP (sin contraseña)

La `LoginPage.vue` por defecto trae este flujo ya cableado:

1. El usuario introduce el email
2. `AuthService.requestOtp({ email })` dispara el email
3. El usuario introduce el código de 6 dígitos
4. `auth.signInWithOtp({ email, code })` intercambia el código por una sesión

### Login social

```ts
import { useAuthStore } from '@synkos/client';

const auth = useAuthStore();

async function signInWithGoogle() {
  await auth.signInWithProvider('google');
}
```

El setup específico del provider (URL schemes, entradas en plist, cambios en AndroidManifest) está documentado en [`@capgo/capacitor-social-login`](https://github.com/Cap-go/capacitor-social-login).

### Desbloqueo biométrico

Tras un login exitoso por contraseña u OTP, el store de auth ofrece habilitar biometría. Las siguientes aperturas de la app usan `BiometricAuth.verifyIdentity()` para reestablecer la sesión sin volver a meter credenciales. Esto lo gestiona el framework — tu código solo comprueba `auth.isAuthenticated`.

## Logout

```ts
import { useSignOut } from '@synkos/client';

const signOut = useSignOut();
await signOut(); // anima despedida, limpia tokens, navega a /auth/login
```

`useSignOut` envuelve `auth.signOut()` con el flujo de UI consciente de plataforma (overlay + animación). Prefiérelo dentro de páginas de settings.

## Gestión de cuenta

`AccountService` cubre las operaciones que esperan los usuarios:

- `AccountService.changePassword({ currentPassword, newPassword })`
- `AccountService.changeEmail({ newEmail })`
- `AccountService.delete({ confirmationToken })`

Se llaman desde las páginas editables de settings bajo `src/pages/settings/account/`. Puedes reemplazar esas páginas por completo sin tocar el framework.

## Picker de username

Si tu app usa usernames únicos, el framework incluye un picker para la primera vez:

- Tras el primer registro, el usuario aterriza en `UsernamePage`.
- `UsernameService.check({ candidate })` debouncea las requests y devuelve disponibilidad.
- Una vez elegido, `UserService.update({ username })` lo persiste.

La página es tuya: edita `src/pages/auth/UsernamePage.vue`.

## Claims custom

Si tu backend almacena campos extra en el usuario (roles, plan, feature flags), extiende el tipo `PublicUser` en tu proyecto:

```ts
// src/types/user.d.ts
import '@synkos/client';

declare module '@synkos/client' {
  interface PublicUser {
    plan?: 'free' | 'pro';
    roles?: string[];
  }
}
```

El store los expondrá en `auth.user` con type safety completo.

## Patrones comunes

### Condicionar UI según el estado de auth

```vue
<script setup lang="ts">
import { useAuthStore } from '@synkos/client';
const auth = useAuthStore();
</script>

<template>
  <AppButton v-if="auth.isAuthenticated" @click="action">Continuar</AppButton>
  <AppButton v-else to="/auth/login">Inicia sesión para continuar</AppButton>
</template>
```

### Reaccionar al login

```ts
import { watch } from 'vue';
import { useAuthStore } from '@synkos/client';

const auth = useAuthStore();
watch(
  () => auth.user?.id,
  (id) => {
    if (id) trackUserSignedIn(id);
  }
);
```

### Llamar endpoints protegidos

```ts
import { getApiClient } from '@synkos/client';

const api = getApiClient();
const { data } = await api.get('/messages'); // access token inyectado automáticamente
```

## Siguientes pasos

- [Capacitor](/docs/guide/capacitor) — setup de los plugins de biometría y social login
- [Routing](/docs/guide/routing) — cómo el guard de auth se conecta a tus rutas
