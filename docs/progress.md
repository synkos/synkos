# Synkos — Registro de Progreso

> Documento vivo. Se actualiza al finalizar cada fase o tarea significativa.

---

## Estado general

| Fase | Descripción | Estado |
|------|-------------|--------|
| 0 | Fundación del monorepo | ✅ Completada |
| 1.1 | Migración `@synkos/server` | ✅ Completada |
| 1.2 | Template `frontend` | ✅ Completada |
| 1.3 | Template `backend` | ✅ Completada |
| 2.1 | `@synkos/utils` | ✅ Completada |
| 2.2 | `@synkos/runtime` | ✅ Completada |
| 2.3 | CLI `create-synkos` | ✅ Completada |
| 3 | `@synkos/ui` | ✅ Completada |
| 4 | `synkos` (frontend core) | ✅ Completada |
| 5 | Playground + Docs + Publicación | ✅ Completada |

---

## FASE 0 — Fundación del Monorepo ✅

**Fecha:** 2026-04-21

### Qué se hizo

- `pnpm-workspace.yaml` configurado con `packages/*`, `apps/*`, `templates/*`
- `package.json` raíz con scripts unificados (`build`, `dev`, `lint`, `typecheck`, `test`, `changeset`)
- `tsconfig.base.json` con `strict`, `ESM-first`, target `ES2022`
- `.prettierrc.json` y `.gitignore` raíz
- `eslint.config.js` flat config (ESLint 9) extendiendo `@synkos/config/eslint`
- `pnpm.onlyBuiltDependencies` para `esbuild`, `sharp`, `msgpackr-extract`

### Paquete `@synkos/config` creado

- `packages/synkos-config/` (renombrado desde `shared/`)
- Exporta: `eslint.js`, `prettier.js`, `tsconfig/base.json`, `tsconfig/node.json`
- Dependencias peer: ESLint 9 + typescript-eslint + prettier

### Infraestructura

- `.changeset/config.json` — versionado semver independiente por paquete
- `.github/workflows/ci.yml` — lint + format + typecheck + build + test en PR/push
- `.github/workflows/release.yml` — changeset publish a npm en `main`

### Skeleton packages creados

Todos los paquetes del workspace tienen `package.json` con nombre, versión, export maps y scripts básicos:

| Directorio | Nombre npm |
|---|---|
| `packages/create-synkos/` | `create-synkos` |
| `packages/synkos/` | `synkos` |
| `packages/synkos-config/` | `@synkos/config` |
| `packages/synkos-runtime/` | `@synkos/runtime` |
| `packages/synkos-server/` | `@synkos/server` |
| `packages/synkos-ui/` | `@synkos/ui` |
| `packages/synkos-utils/` | `@synkos/utils` |

### Verificación

- `pnpm install` limpio, 8 workspaces resueltos, sin warnings
- `pnpm -r exec pwd` confirma los 7 paquetes detectados

---

## FASE 1.1 — Migración `@synkos/server` ✅

**Fecha:** 2026-04-21
**Origen:** `packages/create-versux-api/packages/core/` (`@versux/core@0.1.5`)
**Destino:** `packages/synkos-server/` (`@synkos/server@0.1.0`)

### Qué se hizo

- 74 archivos fuente copiados intactos a `packages/synkos-server/src/`
- `package.json` actualizado: nombre `@synkos/server`, export maps ESM + CJS con `types` primero
- `tsup.config.ts` creado: 14 entry points, formatos `esm` + `cjs`, DTS, sourcemaps
- `tsconfig.json` con `moduleResolution: Bundler` (correcto para paquetes bundleados con tsup)
- Resolución del alias `@/*` → `src/*` via `esbuildOptions.alias` en tsup
- `pnpm.onlyBuiltDependencies` ampliado con `sharp` y `msgpackr-extract`

### Decisiones técnicas

- **`moduleResolution: Bundler`** en lugar de `NodeNext`: el código fuente usa imports sin extensión `.js`; tsup (esbuild) resuelve las rutas, no Node.js directamente
- **Alias `@/` sin tsc-alias**: la resolución se delega a esbuild en build time, eliminando la dependencia de `tsc-alias`
- **No se modificó ningún archivo fuente**: los 74 archivos están idénticos al original

### Qué NO se cambió

- Lógica de módulos: auth, user, account, username, notifications
- Adaptadores: email (Resend/console), storage (R2/noop), cache (Redis/memory), queue (BullMQ/noop), notifications (APNs/noop), metrics (Prometheus/noop)
- Ports (interfaces de contratos)
- Sistema de eventos (`coreEvents`)
- Middleware: authenticate, requireAdmin, request-context
- Bootstrap: app.factory, worker.factory, wire-adapters

### Verificación

```
ESM ⚡️ Build success in 418ms
CJS ⚡️ Build success in 417ms
DTS ⚡️ Build success in 4525ms
```

Sin errores, sin warnings.

---

## FASE 1.2 — Template `frontend` ✅

**Fecha:** 2026-04-21
**Origen:** `packages/create-versux-app/`
**Destino:** `templates/frontend/`

### Qué se hizo

- Copia completa vía `rsync` excluyendo artefactos de build y archivos de entorno
- 2223 archivos copiados (incluye proyecto iOS nativo Xcode)

### Exclusiones aplicadas

| Excluido | Razón |
|---|---|
| `node_modules/` | Se regenera con `pnpm install` |
| `dist/` | Artefacto de build |
| `pnpm-lock.yaml` | Se regenera |
| `.env` | Contiene valores reales del desarrollador |
| `src-capacitor/ios/DerivedData/` | Artefactos Xcode |
| `src-capacitor/android/app/build/` | Artefactos Gradle |
| `CLAUDE.md`, `TODO.md` | Archivos internos del proyecto original |

### Variables dinámicas inyectadas

El CLI (`create-synkos`) reemplazará estas variables al generar un proyecto:

| Variable | Archivo(s) | Descripción |
|---|---|---|
| `{{PROJECT_NAME}}` | `package.json`, `app.config.ts` | Nombre kebab-case del proyecto |
| `{{APP_NAME}}` | `package.json`, `app.config.ts`, `capacitor.config.json` | Nombre display de la app |
| `{{BUNDLE_ID}}` | `app.config.ts`, `capacitor.config.json`, `.env.example` | Bundle ID iOS/Android (`com.company.app`) |
| `{{API_PORT}}` | `.env.example` | Puerto del backend (por defecto `3001`) |

### Qué NO se cambió

- Arquitectura interna: boot files, stores (Pinia), services, router, composables
- Sincronización frontend↔backend: axios interceptors, flujo JWT, refresh token
- Integración Capacitor: push notifications, biometrics, social login
- i18n: inglés + español

---

## FASE 1.3 — Template `backend` ✅

**Fecha:** 2026-04-21
**Origen:** `packages/create-versux-api/packages/create-versux-api/template/`
**Destino:** `templates/backend/`

### Qué se hizo

- Copia limpia del template (26 archivos), excluyendo `CLAUDE.md`
- Reemplazo global de `@versux/core` → `@synkos/server` en todos los archivos fuente, tests y comentarios
- Estandarización de variables al formato `{{...}}` (consistente con `templates/frontend/`)
- `package.json` actualizado: `@synkos/server: "^0.1.0"`, license MIT, formato limpio
- Creado `env.example` completo (el CLI lo renombrará a `.env.example` al generar)

### Variables dinámicas inyectadas

| Variable | Archivo(s) | Descripción |
|---|---|---|
| `{{PROJECT_NAME}}` | `package.json`, `env.example` | Nombre kebab-case del proyecto |
| `{{PROJECT_DESCRIPTION}}` | `package.json` | Descripción corta |
| `{{API_PORT}}` | `env.example` | Puerto del servidor (default `3001`) |
| `{{BUNDLE_ID}}` | `env.example` | Bundle ID para Apple Sign-In / APNs |

### Convención de archivos sin punto

`gitignore`, `dockerignore` y `env.example` van **sin punto** en el template — el CLI los renombra al copiar (`.gitignore`, `.dockerignore`, `.env.example`). Evita que git del monorepo los interprete como propios.

### Qué NO se cambió

- Arquitectura de los 6 puntos de extensión (`bootstrap/`)
- Tests y helpers (`tests/helpers/`)
- Configuración TypeScript (`tsconfig.json`, `tsconfig.build.json`)
- Build system: `tsx` dev + `tsc` + `tsc-alias` build (apropiado para proyectos de usuario, no paquetes)
- `Dockerfile` y `docker-compose`

---

## FASE 2.1 — `@synkos/utils` ✅

**Fecha:** 2026-04-21

### Qué se hizo

- Creado `packages/synkos-utils/` con 5 módulos fuente independientes
- Build: ESM + CJS + DTS, `platform: neutral` (funciona en Node.js y browser)
- Zero dependencias en el barrel principal (`@synkos/utils`)
- Subpath `@synkos/utils/env` con Zod (Node.js only)

### Módulos

| Subpath | Contenido |
|---|---|
| `@synkos/utils` | types + string + object + error (zero deps) |
| `@synkos/utils/env` | `parseEnv(schema, process.env)` con Zod |

### API exportada

**Types:** `Maybe<T>`, `Nullable<T>`, `Optional<T>`, `DeepPartial<T>`, `DeepRequired<T>`, `Prettify<T>`, `NonEmptyArray<T>`, `PartialBy<T,K>`, `RequiredBy<T,K>`, `KeysOfType<T,V>`

**String:** `slugify`, `capitalize`, `toPascalCase`, `toCamelCase`, `truncate`, `isBlank`

**Object:** `pick`, `omit`, `deepMerge`, `isPlainObject`

**Error:** `AppError`, `isAppError`, `Errors.*` (factories: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `tooManyRequests`, `internal`)

**Env:** `parseEnv<T>(schema, data)` — valida y parsea env vars con Zod, muestra errores legibles y hace `process.exit(1)` en fallo

### Fix workspace

Eliminado `templates/*` de `pnpm-workspace.yaml` — los templates son archivos estáticos del CLI, no paquetes del monorepo. Los templates tienen su propio `package.json` que el CLI copia, pero pnpm no debe intentar instalarlos.

---

## FASE 2.2 — `@synkos/runtime` ✅

**Fecha:** 2026-04-21

### Qué se hizo

- Creado `packages/synkos-runtime/` con sistema de plugins y hooks isomórfico
- Zero dependencias en runtime ni en tiempo de compilación
- `platform: neutral` — funciona en Node.js (backend) y browser (frontend Quasar)
- Build: ESM + CJS + DTS en 289ms

### API pública

```ts
// Definir un plugin
export const myPlugin = definePlugin({
  name: 'my-plugin',
  setup(ctx) {
    ctx.hook('onInit', async () => { /* antes de arrancar */ });
    ctx.hook('onReady', () => { /* app lista */ });
    ctx.hook('onDispose', () => { /* cleanup */ });
  },
});

// Definir config (synkos.config.ts)
export default defineConfig({
  app: { name: 'MyApp', version: '1.0.0' },
  plugins: [myPlugin],
});

// Crear y arrancar el runtime
const runtime = createRuntime(config);
await runtime.init();    // onInit → onReady
await runtime.dispose(); // onDispose
```

### Lifecycle hooks

| Hook | Cuándo se llama |
|---|---|
| `onInit` | Al inicio, antes de que la app esté lista |
| `onReady` | Cuando la app está completamente inicializada |
| `onError` | Cuando un hook o plugin lanza un error |
| `onDispose` | Al hacer shutdown graceful |

### Diseño

- `SynkosConfig` es extensible vía module augmentation: `synkos` (frontend) y `@synkos/server` (backend) añadirán sus propias secciones
- Plugins con nombre duplicado se ignoran automáticamente (deduplicación)
- No se puede usar `use()` después de `init()` — error explícito
- `callHook` ejecuta handlers en orden secuencial (predecible, importante para setup)

### Correcciones adicionales

- Corregido orden de `types` en export maps de skeleton packages `synkos` y `@synkos/ui`
- Eliminado `templates/*` del workspace confirmado estable

### Verificación

`pnpm build` — todos los 7 paquetes compilan sin errores ni warnings.

---

## FASE 2.3 — CLI `create-synkos` ✅

**Fecha:** 2026-04-21

### Qué se hizo

- `scripts/copy-templates.mjs` — prebuild script que copia `templates/` al paquete para bundling en npm, excluyendo `src-capacitor/ios/` y `src-capacitor/android/`
- `src/types.ts` — tipos: `ProjectOptions`, `TemplateType`, `PackageManager`
- `src/prompts.ts` — flujo interactivo con `@clack/prompts`: nombre de proyecto, tipo de template, app name, bundle ID, API port, package manager, git, install
- `src/scaffold.ts` — copia el template seleccionado, reemplaza variables `{{...}}`, renombra dotfiles (`gitignore` → `.gitignore`, etc.), ejecuta `git init` y `pnpm install` opcionales
- `src/index.ts` — entry point con shebang `#!/usr/bin/env node`, manejo de `--version`, spinner de progreso, "Next steps"
- `tsup.config.ts` actualizado: solo formato `esm` (CLI no necesita CJS), `dts: false` (binario, no librería)
- `package.json` actualizado: deps `@clack/prompts`, `picocolors`; devDep `@types/node`; script `prebuild`

### Templates soportados

| Valor | Resultado |
|---|---|
| `frontend` | Copia `templates/frontend/` con variables reemplazadas |
| `backend` | Copia `templates/backend/` con variables reemplazadas |
| `fullstack` | Crea `frontend/` + `backend/` + `package.json` raíz con scripts `dev:frontend`, `dev:backend` |

### Variables reemplazadas en archivos de template

| Variable | Descripción |
|---|---|
| `{{PROJECT_NAME}}` | kebab-case del nombre |
| `{{APP_NAME}}` | Nombre display (PascalCase words) |
| `{{BUNDLE_ID}}` | Bundle ID iOS/Android |
| `{{API_PORT}}` | Puerto del backend |
| `{{PROJECT_DESCRIPTION}}` | Descripción generada automáticamente |

### Verificación

```
✓ Copied templates/ (707 entries)
ESM ⚡️ Build success in 6ms
0.1.0   ← node dist/index.js --version
```

Templates verificados: variables presentes, ios/android excluidos, dotfiles correctos.

---

## FASE 3 — `@synkos/ui` ✅

**Fecha:** 2026-04-21

### Qué se hizo

- Creado sistema de design tokens en `src/styles/variables.scss` — copia autoritativa del design system iOS del template frontend
- Build con **Vite lib mode** + `@vitejs/plugin-vue` + `vite-plugin-dts` (tsup no procesa `.vue`)
- SCSS inyectado globalmente via `css.preprocessorOptions.scss.additionalData` con `loadPaths`

### Componentes exportados

| Componente | Descripción |
|---|---|
| `AppEmptyState` | Estado vacío con icono, título, subtítulo y CTA |
| `AppListRow` | Fila de lista iOS: icono, label, hint, valor, chevron, "coming soon" |
| `AppListSection` | Contenedor de grupo de filas con encabezado uppercase |
| `AppListDivider` | Separador 0.5px con indent configurable |
| `AppPageLargeTitle` | Header de página estilo iOS (34px) con slot right |
| `SegmentControl` | Control de segmentos tipo iOS, v-model compatible |

### Composable exportado

| Composable | Descripción |
|---|---|
| `useSheetDrag` | Rubber-band drag para bottom sheets (iOS-like, sin deps externas) |

### API de estilos

- `@synkos/ui/styles` → CSS compilado (importar en `main.ts`)
- `@synkos/ui/variables.scss` → tokens SCSS para override en apps

### Cambios respecto al template

- `AppListRow`: eliminada dependencia de `vue-i18n`; texto "Coming soon" ahora es prop `comingSoonLabel` (default: `'Coming soon'`)
- `SplashOverlay`, `usePullToRefresh` excluidos — dependen del auth store y de `@capacitor/haptics` del template

### Build

```
dist/ui.css        3.66 kB │ gzip: 1.06 kB
dist/synkos-ui.js  6.28 kB │ gzip: 2.08 kB
Declaration files built in 533ms
```

### Peer deps

- `vue@^3`, `quasar@^2`

---

## FASE 4 — `synkos` (frontend core) ✅

**Fecha:** 2026-04-21

### Qué se hizo

- `src/types.ts` — interfaz `AppConfig` completa (identity, company, storageKeys, features, links, native/Capacitor)
- `src/config.ts` — `defineAppConfig(config)` identity function para tipado
- `src/plugin.ts` — `createSynkosPlugin(config): Plugin` + `useAppConfig()` composable con inject
- `src/router.ts` — `createAuthGuard(options): NavigationGuard` factory parametrizable

### API exportada

```ts
// app.config.ts
import { defineAppConfig } from 'synkos';
export const appConfig = defineAppConfig({ name: 'My App', ... });

// main.ts / boot file
import { createSynkosPlugin } from 'synkos';
app.use(createSynkosPlugin(appConfig));

// cualquier componente
import { useAppConfig } from 'synkos';
const config = useAppConfig(); // tipado completo

// router/index.ts
import { createAuthGuard } from 'synkos';
Router.beforeEach(createAuthGuard({
  loginRoute: 'auth-login',
  homeRoute: 'home',
  getState: () => useAuthStore(),
}));
```

### Build

```
ESM ⚡️ Build success in 7ms   dist/index.js     1.37 KB
CJS ⚡️ Build success in 6ms   dist/index.cjs    2.35 KB
DTS ⚡️ Build success in 258ms dist/index.d.ts   2.92 KB
```

### Peer deps

- `vue@^3`, `vue-router@^4`

---

## FASE 5 — Playground + Docs + Publicación ✅

**Fecha:** 2026-04-21

### Qué se hizo

- `README.md` raíz — reescrito de spec técnico a README de usuario con Quick Start, tabla de paquetes, estructura del monorepo
- `packages/create-synkos/README.md` — uso del CLI, templates, variables
- `packages/synkos/README.md` — API completa con ejemplos de código
- `packages/synkos-ui/README.md` — componentes, composables, design tokens
- `packages/synkos-utils/README.md` — todos los módulos con ejemplos
- `packages/synkos-runtime/README.md` — plugins, lifecycle hooks, module augmentation
- `packages/synkos-server/README.md` — entry points, adapters, auth module
- `packages/synkos-config/README.md` — ESLint, Prettier, TypeScript configs

### Playground

`apps/playground/` — app Node.js ejecutable que demuestra `@synkos/utils` y `@synkos/runtime` con dependencias workspace.

```bash
pnpm --filter playground start
```

Output verificado: slugify, toPascalCase, Errors, isAppError, plugin lifecycle completo.

### Changeset inicial

`.changeset/initial-release.md` — bump `minor` para los 7 paquetes publicables.

`pnpm changeset status` confirma:
- **minor**: create-synkos, synkos, @synkos/ui, @synkos/server, @synkos/runtime, @synkos/utils, @synkos/config

---

## 🚀 Listo para publicar

Todos los paquetes compilados, documentados, y con changeset. Ver instrucciones en el README raíz.


## Contexto técnico

### Stack

| Capa | Tecnología |
|---|---|
| Backend framework | Express 5 + Mongoose 9 + Zod 4 |
| Frontend framework | Quasar 2 + Vue 3 + Capacitor 8 |
| Estado frontend | Pinia 3 |
| HTTP client | Axios 1 con interceptors JWT |
| Build packages | tsup 8 (ESM + CJS + DTS) |
| Build frontend | Vite via @quasar/app-vite |
| Monorepo | pnpm workspaces |
| Versionado | Changesets |
| CI/CD | GitHub Actions |

### Variables de template (referencia CLI)

```
{{PROJECT_NAME}}   → kebab-case   → my-app
{{APP_NAME}}       → display      → My App
{{BUNDLE_ID}}      → bundle id    → com.company.myapp
{{API_PORT}}       → puerto       → 3001
```
