---
title: Deployment
description: Building for iOS, Android and the web.
order: 6
---

A Synkos project ships three artifacts from the same codebase: an iOS `.ipa`, an Android `.aab`/`.apk`, and a web build (PWA). This guide covers the build commands and what each platform needs.

## Web (PWA)

The simplest target. One command produces a static site.

```bash
pnpm build
```

The output lands in `dist/spa/`. Deploy it to any static host: Cloudflare Pages, Netlify, Vercel, S3 + CloudFront. No server required.

If you need server-side concerns (analytics token injection, IP-based redirects), front the static site with a small edge worker — don't switch to SSR for it.

## iOS

### Prerequisites

- macOS with Xcode installed
- An Apple Developer account
- A signing identity in your Mac keychain
- An App ID + provisioning profile on developer.apple.com

### Build

```bash
pnpm build:ios
```

This runs `quasar build -m capacitor -T ios`, which:

1. Builds the Vue app into `dist/`
2. Copies it into the iOS project at `src-capacitor/ios/App/App/public`
3. Runs `cap sync ios` to update Capacitor plugins
4. Opens Xcode

From Xcode, **Product → Archive** to build for distribution. Upload to App Store Connect from there.

For dev iteration without Xcode:

```bash
pnpm dev:ios
```

That command boots the app in a simulator with hot reload — fastest feedback loop.

### Common iOS issues

| Symptom                         | Fix                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `Pods` not building             | `cd src-capacitor/ios/App && pod install`                                                |
| Push notifications don't arrive | Enable the **Push Notifications** capability in Xcode                                    |
| Camera/biometric prompt missing | Add the matching `NSCameraUsageDescription` / `NSFaceIDUsageDescription` to `Info.plist` |
| Social login redirect fails     | Register your URL scheme in `Info.plist`                                                 |

## Android

### Prerequisites

- Android Studio with the SDK
- A device or emulator
- A signing key (`keystore.jks`) for release builds

### Build

```bash
pnpm build:android
```

This runs `quasar build -m capacitor -T android`. Open the generated project in Android Studio for signing and Play Store upload.

For dev iteration:

```bash
pnpm dev:android
```

### Signing for release

Generate a keystore once:

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-app -keyalg RSA -keysize 2048 -validity 10000
```

Place it in `src-capacitor/android/app/` and reference it in `gradle.properties`. Don't commit it.

### Common Android issues

| Symptom                     | Fix                                                              |
| --------------------------- | ---------------------------------------------------------------- |
| Build fails on Java version | Use Java 17. Set `JAVA_HOME` and `org.gradle.java.home`          |
| Push tokens are empty       | Drop your `google-services.json` in `src-capacitor/android/app/` |
| Biometric not prompting     | Add `USE_BIOMETRIC` permission to `AndroidManifest.xml`          |
| Social login fails          | Register the SHA-1 of your debug keystore in the Google console  |

## Backend

The frontend doesn't dictate where your backend runs. Synkos's `apps/backend` (the Node + Express skeleton) deploys cleanly to:

- **Railway** — push the repo, it Just Works (built-in Postgres, env vars, deploys per branch)
- **Fly.io** — `fly launch` from `apps/backend`
- **Render** — Web Service from the repo, auto-deploys per commit
- **Self-hosted** — `pnpm --filter backend build` then `node dist/main.js` behind a reverse proxy

The auth, push notifications and account services in `@synkos/client` only require a small set of REST endpoints. See the [Authentication guide](/docs/guide/auth#backend-contract) for the contract.

## CI/CD

A typical pipeline has three jobs:

1. **Test** on every PR (`pnpm typecheck && pnpm test`)
2. **Build web** on merge to main, deploy to your CDN
3. **Build native** on tag (`v*.*.*`), upload to TestFlight / Play Console

Build native binaries need a macOS runner for iOS — GitHub Actions and Bitrise both work. Android builds run on any Linux runner.

## Versioning

Bump these in lockstep when you release:

| File                                     | What to update                                   |
| ---------------------------------------- | ------------------------------------------------ |
| `package.json`                           | `version`                                        |
| `src-capacitor/ios/App/App/Info.plist`   | `CFBundleShortVersionString` + `CFBundleVersion` |
| `src-capacitor/android/app/build.gradle` | `versionName` + `versionCode`                    |

A small script in `scripts/bump-version.mjs` (template includes one) does this in a single command.

## Next steps

- [Authentication](/docs/guide/auth) — wiring social login + push to a backend
- [Routing](/docs/guide/routing) — what changes between web and native (back gestures, history mode)
