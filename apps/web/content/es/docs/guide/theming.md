---
title: Theming
description: Tokens SCSS, CSS custom properties, claro y oscuro, valores conscientes de plataforma.
order: 3
---

Synkos tiene un sistema de tema en tres capas: variables SCSS para tokens en tiempo de compilación, CSS custom properties para colores switcheables en runtime, y tokens de plataforma que adaptan la UI a iOS o Android. Aprende las capas y podrás rebrand-ear el framework sin tocar código de componentes.

## Las tres capas

### Capa 1 — Variables SCSS (`quasar.variables.scss`)

Tokens de diseño en tiempo de compilación: spacing, radii, tamaños de fuente, line heights. Disponibles dentro de cualquier bloque `<style lang="scss">`.

```scss
// src/css/quasar.variables.scss
$space-1: 4px;
$space-4: 16px;
$radius-md: 10px;
$font-body: 15px;
$font-body-lg: 17px;
```

```vue
<style lang="scss" scoped>
.card {
  padding: $space-4;
  border-radius: $radius-md;
  font-size: $font-body;
}
</style>
```

Estos no cambian en runtime. Son tokens, no valores de tema.

### Capa 2 — CSS custom properties (temas)

Colores switcheables en runtime. Dos archivos, uno por tema:

```scss
// src/css/dark.theme.scss (default)
[data-theme='dark'] {
  --color-primary: #7c3aed;
  --bg-canvas: #0a0a0b;
  --bg-elevated: #111114;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --border-default: rgba(255, 255, 255, 0.1);
}
```

```scss
// src/css/light.theme.scss
[data-theme='light'] {
  --color-primary: #6d28d9;
  --bg-canvas: #ffffff;
  --bg-elevated: #fafafa;
  --text-primary: #0a0a0b;
  --text-secondary: #52525b;
  --border-default: rgba(0, 0, 0, 0.1);
}
```

`SynkosApp.vue` togglea `data-theme` en `<html>`. Usa las variables en todas partes:

```vue
<style lang="scss" scoped>
.card {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
</style>
```

### Capa 3 — Tokens de plataforma (`platform.scss`)

Algunos valores cambian entre iOS y Android: la altura de la nav bar, la altura de la tab bar, las curvas de transición, el manejo de safe area. Estos están dirigidos por `data-platform` en `<html>`:

```scss
[data-platform='ios'] {
  --nav-bar-height: 44px;
  --tab-bar-height: 83px;
  --transition-curve: cubic-bezier(0.32, 0.72, 0, 1);
}

[data-platform='android'] {
  --nav-bar-height: 56px;
  --tab-bar-height: 64px;
  --transition-curve: cubic-bezier(0.4, 0, 0.2, 1);
}

[data-platform='web'] {
  --nav-bar-height: 56px;
  --tab-bar-height: 64px;
  --transition-curve: cubic-bezier(0.4, 0, 0.2, 1);
}
```

`createSynkosBoot` aplica el `data-platform` correcto por ti. Tú solo consumes las variables.

## Cambiar tema

Usa `useTheme()` desde `@synkos/client`:

```ts
import { useTheme } from '@synkos/client';

const { theme, applyTheme } = useTheme();

theme.value; // 'light' | 'dark' | 'system'
applyTheme('light'); // persiste y re-renderiza
applyTheme('system'); // sigue la preferencia del SO, escucha cambios
```

El modo `system` escucha `prefers-color-scheme` y actualiza sin recargar. La persistencia usa `@capacitor/preferences`, así que sobrevive a reinicios de la app.

## Tokens de la pantalla de auth

La pantalla de login tiene su propio subset de tokens para que puedas rebrand-ear auth sin tocar el resto de la app:

```scss
[data-theme='dark'] {
  --auth-bg: linear-gradient(140deg, #0a0a0b, #111114);
  --auth-text-primary: #ffffff;
  --auth-text-secondary: #a1a1aa;
  --auth-surface-card: rgba(255, 255, 255, 0.04);
  --auth-surface-input: rgba(255, 255, 255, 0.08);
}
```

Sobreescribe estos en los archivos de tema de tu proyecto para que `LoginPage.vue` se vea como tu marca sin editar la página.

## Estilo condicional por plataforma

Prefiere CSS sobre JS para estilo específico de plataforma. Usa el atributo `data-platform` en `<html>`:

```scss
[data-platform='ios'] .header {
  font-weight: 600; // SF heavy
  letter-spacing: -0.4px;
}

[data-platform='android'] .header {
  font-weight: 500; // Roboto medium
  letter-spacing: 0;
}
```

Para checks de plataforma basados en JS, usa `usePlatform()` (mira la [guía de Capacitor](/docs/guide/capacitor)).

## Dónde poner tokens nuevos

| Tipo de valor                             | Dónde va                                    |
| ----------------------------------------- | ------------------------------------------- |
| Spacing, radius, escala tipográfica       | `quasar.variables.scss`                     |
| Color de marca (cambia por tema)          | `dark.theme.scss` + `light.theme.scss`      |
| Color de marca específico de auth         | `--auth-*` en ambos archivos de tema        |
| Diferencia de plataforma (iOS vs Android) | `platform.scss` bajo cada `[data-platform]` |
| Valor interno del componente sin reuso    | Inline en el `<style>` del componente       |

## Anti-patrones

**No hardcodees colores.** Usa siempre una CSS custom property — incluso para cosas que crees que son "solo negro":

```vue
<!-- ❌ -->
<style scoped>
.card {
  background: #111;
  color: #fff;
}
</style>

<!-- ✅ -->
<style scoped>
.card {
  background: var(--bg-elevated);
  color: var(--text-primary);
}
</style>
```

**No metas branches de plataforma en JS a menos que sea imprescindible.** Una regla CSS de dos líneas le gana a un watcher de `usePlatform()`.

**No modifiques los archivos de tema del framework en tu proyecto.** Viven en `src/css/`. Sobreescribe los valores ahí; no forkees el framework.

## Patrones comunes

### Override de tema por componente

Envuelve una sección con un atributo `data-theme` para forzar un tema localmente:

```vue
<template>
  <section data-theme="dark" class="hero">
    <!-- esta sección siempre es oscura, aunque la app esté en modo claro -->
  </section>
</template>
```

### Leer una variable CSS desde JS

```ts
const root = getComputedStyle(document.documentElement);
const primary = root.getPropertyValue('--color-primary').trim();
```

### Añadir tu propia variable de marca

En ambos `dark.theme.scss` y `light.theme.scss`:

```scss
[data-theme='dark'] {
  --brand-confetti: #ff44a4;
}
[data-theme='light'] {
  --brand-confetti: #d62888;
}
```

Úsala igual que cualquier otro token: `background: var(--brand-confetti);`.

## Siguientes pasos

- [i18n](/docs/guide/i18n) — traducir los strings de tu app
- [Capacitor](/docs/guide/capacitor) — cuándo recurrir a `usePlatform()` en lugar de CSS
