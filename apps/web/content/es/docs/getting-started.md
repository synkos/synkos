---
title: Empezar
description: Monta tu primera app de Synkos en menos de un minuto.
order: 1
---

Bienvenido a Synkos. Esta página te lleva de cero a una app corriendo en tres comandos.

## Requisitos

Necesitas:

- **Node.js** 20 o superior
- **pnpm** 10 o superior
- Un terminal con el que te sientas cómodo

Si planeas compilar para iOS, también necesitas un Mac con **Xcode** instalado. Para Android, **Android Studio** con el SDK y un emulador configurado.

## Crear un proyecto

```bash
pnpm create synkos mi-app
cd mi-app
pnpm install
```

El CLI te pedirá el nombre del proyecto, el nombre visible de la app y el bundle ID, y montará un proyecto Synkos nuevo con todo conectado.

## Ejecutar

```bash
pnpm dev
```

Tu app arranca en `http://localhost:9000` con hot reload, el flujo de autenticación, las páginas de settings y el ejemplo de home page ya funcionando.

## Qué viene incluido

Un proyecto Synkos recién creado trae:

- Un flujo de autenticación completo (email + OTP, login social, biometría)
- Un árbol de settings (perfil, cuenta, preferencias, notificaciones, seguridad, billing, support, legal, about)
- Theming con CSS custom properties (claro y oscuro)
- i18n con strings core en inglés y español
- Una navegación con feel nativo (tab bar, títulos grandes, gestos de swipe)
- Plugins de Capacitor seleccionados y preconfigurados

## Siguientes pasos

- Lee la [guía de routing](/docs/guide/routing) para entender cómo se declaran las páginas y las tabs.
- Lee la [guía de auth](/docs/guide/auth) para conectar tu backend.
- Lee la [guía de theming](/docs/guide/theming) para hacer la app tuya.

> ¿Bloqueado? Abre un issue en GitHub o únete a la discusión. Somos un equipo pequeño y lo leemos todo.
