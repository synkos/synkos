---
title: Despliegue
description: Construir para iOS, Android y la web.
order: 6
---

Un proyecto Synkos genera tres artefactos desde el mismo código: un `.ipa` de iOS, un `.aab`/`.apk` de Android y una build web (PWA). Esta guía cubre los comandos de build y lo que necesita cada plataforma.

## Web (PWA)

El target más simple. Un comando produce un sitio estático.

```bash
pnpm build
```

La salida cae en `dist/spa/`. Despliégalo a cualquier hosting estático: Cloudflare Pages, Netlify, Vercel, S3 + CloudFront. No requiere servidor.

Si necesitas cosas server-side (inyección de tokens de analytics, redirects basados en IP), pon un edge worker pequeño delante del sitio estático — no cambies a SSR para eso.

## iOS

### Requisitos

- macOS con Xcode instalado
- Una cuenta de Apple Developer
- Una identidad de firma en tu llavero del Mac
- Un App ID + provisioning profile en developer.apple.com

### Build

```bash
pnpm build:ios
```

Esto corre `quasar build -m capacitor -T ios`, que:

1. Compila la app Vue en `dist/`
2. La copia al proyecto iOS en `src-capacitor/ios/App/App/public`
3. Ejecuta `cap sync ios` para actualizar plugins de Capacitor
4. Abre Xcode

Desde Xcode, **Product → Archive** para construir para distribución. Sube a App Store Connect desde ahí.

Para iteración en dev sin Xcode:

```bash
pnpm dev:ios
```

Ese comando arranca la app en un simulador con hot reload — el bucle de feedback más rápido.

### Problemas comunes en iOS

| Síntoma                             | Solución                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Pods` no compila                   | `cd src-capacitor/ios/App && pod install`                                                        |
| Las push notifications no llegan    | Habilita la capability **Push Notifications** en Xcode                                           |
| Falta el prompt de cámara/biometría | Añade el `NSCameraUsageDescription` / `NSFaceIDUsageDescription` correspondiente al `Info.plist` |
| El redirect de social login falla   | Registra tu URL scheme en `Info.plist`                                                           |

## Android

### Requisitos

- Android Studio con el SDK
- Un dispositivo o emulador
- Una clave de firma (`keystore.jks`) para builds de release

### Build

```bash
pnpm build:android
```

Esto corre `quasar build -m capacitor -T android`. Abre el proyecto generado en Android Studio para firmar y subir a Play Store.

Para iteración en dev:

```bash
pnpm dev:android
```

### Firmar para release

Genera un keystore una vez:

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-app -keyalg RSA -keysize 2048 -validity 10000
```

Pónlo en `src-capacitor/android/app/` y referénciálo en `gradle.properties`. No lo commitees.

### Problemas comunes en Android

| Síntoma                         | Solución                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| Build falla por versión de Java | Usa Java 17. Define `JAVA_HOME` y `org.gradle.java.home`          |
| Los tokens de push están vacíos | Mete tu `google-services.json` en `src-capacitor/android/app/`    |
| La biometría no aparece         | Añade el permiso `USE_BIOMETRIC` al `AndroidManifest.xml`         |
| El login social falla           | Registra el SHA-1 de tu keystore de debug en la consola de Google |

## Backend

El frontend no dicta dónde corre tu backend. El esqueleto de Node + Express en `apps/backend` despliega limpio a:

- **Railway** — pusheas el repo, funciona solo (Postgres incluido, env vars, deploys por rama)
- **Fly.io** — `fly launch` desde `apps/backend`
- **Render** — Web Service desde el repo, auto-deploys por commit
- **Self-hosted** — `pnpm --filter backend build` y luego `node dist/main.js` detrás de un reverse proxy

Los servicios de auth, push notifications y cuenta en `@synkos/client` solo requieren un set pequeño de endpoints REST. Mira la [guía de Autenticación](/docs/guide/auth#contrato-del-backend) para el contrato.

## CI/CD

Un pipeline típico tiene tres jobs:

1. **Test** en cada PR (`pnpm typecheck && pnpm test`)
2. **Build web** al hacer merge a main, deploy a tu CDN
3. **Build native** en tag (`v*.*.*`), upload a TestFlight / Play Console

Para builds nativos de iOS necesitas un runner macOS — GitHub Actions y Bitrise valen ambos. Los builds de Android corren en cualquier runner Linux.

## Versionado

Bumpea estos en sincronía cuando saques release:

| Archivo                                  | Qué actualizar                                   |
| ---------------------------------------- | ------------------------------------------------ |
| `package.json`                           | `version`                                        |
| `src-capacitor/ios/App/App/Info.plist`   | `CFBundleShortVersionString` + `CFBundleVersion` |
| `src-capacitor/android/app/build.gradle` | `versionName` + `versionCode`                    |

Un script pequeño en `scripts/bump-version.mjs` (el template incluye uno) lo hace en un solo comando.

## Siguientes pasos

- [Autenticación](/docs/guide/auth) — conectar social login + push a un backend
- [Routing](/docs/guide/routing) — qué cambia entre web y nativo (gestos de back, modo de history)
