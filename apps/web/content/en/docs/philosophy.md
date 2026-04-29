---
title: Philosophy
description: The principles that shape Synkos.
order: 2
---

Synkos is opinionated. Knowing the principles helps you understand why things are the way they are — and when to push back.

## Convention over configuration

The 80% case should require no configuration. You should be able to run `pnpm create synkos`, build something real, and never touch the framework internals if you don't want to.

When you do want to dig in, every layer is replaceable. No magic.

## Headless logic, owned UI

The framework owns the **logic**: stores, services, guards, services. Your project owns the **UI**: pages, components, styles. We provide built-in fallback pages, but the moment you want to customize them, you copy them into your project and they become yours.

This means upgrades never break your design.

## Mobile-first, web-ready

Synkos is built for mobile apps that also run on the web — not for web apps that happen to also run on phones. Touch gestures, native transitions, large titles, biometric unlock. The web build is the same code, just without the native bridge.

## Vertical, not horizontal

Instead of being a thin layer over many tools, Synkos chooses a small number of opinions and integrates them deeply. Vue + Capacitor + Pinia + vue-i18n. That's the contract. We won't add another router or another state library.

If you need a different stack, this isn't the framework for you. That's fine.
