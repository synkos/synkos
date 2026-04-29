---
title: Getting started
description: Scaffold your first Synkos app in under a minute.
order: 1
---

Welcome to Synkos. This page will get you from zero to a running app in three commands.

## Prerequisites

You need:

- **Node.js** 20 or newer
- **pnpm** 10 or newer
- A terminal you're comfortable with

If you plan to build for iOS, you also need a Mac with **Xcode** installed. For Android, **Android Studio** with the SDK and an emulator configured.

## Create a new project

```bash
pnpm create synkos my-app
cd my-app
pnpm install
```

The CLI will ask for your project name, app display name, and bundle ID, then scaffold a fresh Synkos project with everything wired up.

## Run it

```bash
pnpm dev
```

Your app boots at `http://localhost:9000` with hot reload, the auth flow, the settings pages and the example home page already working.

## What you get out of the box

A fresh Synkos project ships with:

- A complete authentication flow (email + OTP, social login, biometric unlock)
- A settings tree (profile, account, preferences, notifications, security, billing, support, legal, about)
- Theming with CSS custom properties (dark and light)
- i18n with English and Spanish core strings
- A native-feeling navigation (tab bar, large titles, swipe gestures)
- Capacitor plugins curated and pre-configured

## Next steps

- Read the [routing guide](/docs/guide/routing) to understand how pages and tabs are declared.
- Read the [auth guide](/docs/guide/auth) to wire your backend.
- Read the [theming guide](/docs/guide/theming) to make the app yours.

> Stuck? Open an issue on GitHub or join the discussion. We're a small team and we read everything.
