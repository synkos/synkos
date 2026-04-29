# Synkos web — `apps/web`

> Web pública de Synkos (synkos.dev): landing, documentación, blog. Vive dentro del monorepo y consume `@synkos/ui` + `@synkos/client` directamente para que los previews del catálogo de componentes rendericen el código real, no copias.

## Índice

- [Visión general](#visión-general)
- [Stack y arquitectura](#stack-y-arquitectura)
- [Estructura del directorio](#estructura-del-directorio)
- [Desarrollo](#desarrollo)
  - [Comandos](#comandos)
  - [Variables de entorno](#variables-de-entorno)
- [Pipeline de documentación auto-generada](#pipeline-de-documentación-auto-generada)
  - [Qué se auto-genera](#qué-se-auto-genera)
  - [Convención JSDoc](#convención-jsdoc)
  - [Demos en vivo](#demos-en-vivo)
  - [Silhouettes (catálogo visual)](#silhouettes-catálogo-visual)
  - [El comando `pnpm sync:docs`](#el-comando-pnpm-syncdocs)
- [i18n (EN + ES)](#i18n-en--es)
- [Despliegue (Railway)](#despliegue-railway)
- [Integración en el workflow del monorepo](#integración-en-el-workflow-del-monorepo)
  - [Cuándo se ejecuta `sync:docs`](#cuándo-se-ejecuta-syncdocs)
  - [CI / GitHub Actions](#ci--github-actions)
  - [Hook PostToolUse](#hook-posttooluse)
  - [Agente `documenter`](#agente-documenter)
  - [Workflow `sync-docs.yaml`](#workflow-sync-docsyaml)
  - [Workflow `push-git.yaml` (cómo afecta)](#workflow-push-gityaml-cómo-afecta)
- [Casos de uso paso a paso](#casos-de-uso-paso-a-paso)
- [Troubleshooting](#troubleshooting)

---

## Visión general

`apps/web` es una aplicación **Nuxt 3** que cumple tres roles en una sola URL:

| Sección              | Contenido                                          | Origen                                                      |
| -------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| **Landing** (`/`)    | Hero, features, code showcase, CTA                 | Hand-written en `pages/index.vue`                           |
| **Docs** (`/docs/*`) | Getting started, guías, componentes, API reference | Mezcla: guías hand-written + componentes/API auto-generados |
| **Blog** (`/blog/*`) | Releases y posts                                   | Hand-written en `content/{en,es}/blog/`                     |

La diferencia clave entre **docs hand-written** y **docs auto-generadas**:

- **Hand-written** (`/docs/getting-started`, `/docs/guide/*`): markdown editado directamente. Vives en `apps/web/content/{en,es}/docs/`.
- **Auto-generadas** (`/docs/components/*`, `/docs/api/*`): se producen ejecutando `pnpm sync:docs` desde el código fuente de `packages/synkos-ui` y `packages/synkos-client`. **Nunca se editan a mano** — llevan un header `<!-- AUTO-GENERATED -->` para que sea evidente.

---

## Stack y arquitectura

| Capa                 | Tecnología                       | Notas                                                      |
| -------------------- | -------------------------------- | ---------------------------------------------------------- |
| Framework            | Nuxt 3.21                        | SSR + SPA por ruta                                         |
| Contenido            | `@nuxt/content` v3               | 4 colecciones tipadas (en_docs, es_docs, en_blog, es_blog) |
| i18n                 | `@nuxtjs/i18n` v9                | EN default + ES con `prefix_except_default`                |
| UI components reales | `@synkos/ui` + `@synkos/client`  | importados via `workspace:*`                               |
| Syntax highlighting  | Shiki (incluido en Content)      | tema `github-dark`                                         |
| Search               | `@nuxt/content` built-in         | (Algolia DocSearch en fase 4)                              |
| Deploy               | Railway (Dockerfile multi-stage) | Node SSR, dominio `synkos.dev`                             |

**Por qué `workspace:*` para los componentes**: queremos que las demos del catálogo (`/docs/components/<name>`) rendericen el componente real, no una mini-implementación. Eso garantiza que la documentación nunca puede divergir de la implementación.

---

## Estructura del directorio

```
apps/web/
├── nuxt.config.ts                  ← config Nuxt (i18n, content, vite, ssr)
├── content.config.ts               ← schema de las 4 colecciones tipadas
├── package.json                    ← scripts: dev, build, sync:docs, prebuild
├── tsconfig.json                   ← extends .nuxt/tsconfig.json
├── Dockerfile                      ← deploy Railway (multi-stage)
├── railway.toml                    ← config Railway
├── app.vue + error.vue
├── layouts/
│   ├── default.vue                 ← landing, blog, marketing
│   └── docs.vue                    ← sidebar + content + TOC
├── pages/
│   ├── index.vue                   ← landing
│   ├── docs/[...slug].vue          ← docs renderer (catch-all)
│   ├── blog/index.vue              ← blog list
│   └── blog/[slug].vue             ← blog post renderer
├── components/
│   ├── shared/                     ← Header, Footer, Logo, ThemeToggle, LanguageSwitcher
│   ├── docs/                       ← Sidebar, TOC, EditOnGitHub, ComponentDemo
│   ├── landing/                    ← Hero, Features, CodeShowcase, CTA
│   ├── ComponentSilhouette.vue     ← 22 formas CSS para el catálogo
│   ├── ComponentsCatalog.vue       ← grid de cards por categoría
│   └── <Name>Demo.vue              ← 13 demos en vivo (AppButtonDemo, OtpInputDemo, ...)
├── composables/useTheme.ts         ← dark/light + persistencia
├── plugins/theme.client.ts         ← anti-flash en hydration
├── content/
│   ├── en/
│   │   ├── docs/
│   │   │   ├── getting-started.md  ← hand-written
│   │   │   ├── philosophy.md
│   │   │   ├── guide/*.md          ← 6 guías core
│   │   │   ├── components/         ← AUTO (22 .md + index.md)
│   │   │   └── api/                ← AUTO (7 .md + index.md)
│   │   └── blog/*.md
│   └── es/                         ← guías + blog (sin components/api, fallback al EN)
├── i18n/locales/{en,es}.json       ← strings de la UI propia (header, footer, etc.)
├── assets/
│   ├── css/
│   │   ├── tokens.scss             ← spacing, radius, type scale
│   │   ├── theme.scss              ← CSS custom props para dark/light
│   │   └── main.scss               ← reset + tipografía + helpers
│   └── generated/                  ← AUTO (manifests JSON consumidos por Vue)
│       ├── components.manifest.json
│       └── api.manifest.json
├── scripts/
│   ├── sync-docs.mjs               ← orchestrator
│   ├── extract-components.mjs      ← vue-docgen-api driver
│   ├── extract-api.mjs             ← TypeDoc driver
│   └── templates.mjs               ← render helpers de markdown
└── public/                         ← favicon y assets estáticos
```

**Reglas críticas:**

- **Nunca edites a mano** archivos bajo `content/en/docs/{components,api}/` ni `assets/generated/`. Llevan header `<!-- AUTO-GENERATED -->` y se sobrescriben en cada `pnpm sync:docs`. Si necesitan cambiar, edita el JSDoc en `packages/` y re-genera.
- **Las guías** (`content/{en,es}/docs/getting-started.md`, `content/{en,es}/docs/guide/*.md`, `content/{en,es}/docs/philosophy.md`) sí se editan a mano.

---

## Desarrollo

### Comandos

Desde la raíz del monorepo:

```bash
pnpm dev:web            # arranca Nuxt en http://localhost:3000 (o 3001 si está ocupado)
pnpm build:web          # build de producción → apps/web/.output/
pnpm sync:docs          # regenera componentes/API desde packages/
```

Desde `apps/web/`:

```bash
pnpm dev                # idéntico a dev:web
pnpm build              # idéntico a build:web (corre prebuild → sync:docs)
pnpm typecheck          # vue-tsc
pnpm preview            # sirve la build de producción local
```

El `prebuild` script de `apps/web/package.json` ejecuta `pnpm sync:docs` automáticamente — esto garantiza que en deploy las docs siempre estén frescas aunque el autor haya olvidado regenerarlas localmente.

### Variables de entorno

```bash
# .env (copia desde .env.example)
NUXT_PUBLIC_SITE_URL=https://synkos.dev
NUXT_PUBLIC_GITHUB_REPO=https://github.com/synkos/synkos
```

Se exponen en cliente vía `useRuntimeConfig().public`. En Railway las defines en la UI del servicio.

---

## Pipeline de documentación auto-generada

Esta es la pieza diferenciadora del proyecto. Documentación que vive con el código y se sincroniza automáticamente.

### Qué se auto-genera

```
packages/synkos-ui/src/components/**/*.vue        ┐
packages/synkos-client/src/vue/**/*.vue           ├──▶ vue-docgen-api ──▶ apps/web/content/en/docs/components/*.md
                                                  │                       (22 .md + index.md)
packages/synkos-client/src/index.ts (TypeDoc)     │
packages/synkos-ui/src/index.ts                   ├──▶ TypeDoc ──────────▶ apps/web/content/en/docs/api/*.md
                                                  │                       (7 .md por categoría + index.md)
                                                  └──▶ ambos ────────────▶ apps/web/assets/generated/*.manifest.json
                                                                          (consumidos por ComponentsCatalog.vue)
```

**Componentes** se documentan con `vue-docgen-api`: extrae props, slots, events, JSDoc del SFC.

**API TypeScript** (`@synkos/client` y `@synkos/ui`) se documenta con TypeDoc programático. El script `extract-api.mjs` agrupa los símbolos en 7 categorías:

| Categoría      | Match                                                                            | Ejemplos                                      |
| -------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| Composables    | `function use*` (excluye stores)                                                 | `useNavTitle`, `usePlatform`, `useTheme`      |
| Stores         | `useAuthStore`, `useSettingsStore`                                               | (especiales)                                  |
| Services       | nombres acabados en `Service`                                                    | `AuthService`, `UserService`                  |
| Router         | `createSynkosRouter`, `setupSynkosRouter`, `synkosSettingsRoutes`                |                                               |
| Boot factories | `function create*Boot`                                                           | `createSynkosBoot`, `createAuthBoot`          |
| Utilities      | `getIcon`, `icons`, `coreEnUS`, `coreEsES`, `getClientConfig`, `createApiClient` |                                               |
| Types          | `TypeAlias` + `Interface`                                                        | `PublicUser`, `AppTheme`, `SynkosBootOptions` |

### Convención JSDoc

**Todo componente exportado** debe tener JSDoc al inicio del `<script setup>`. La descripción del componente NO va como comentario HTML ni en un bloque `<script>` separado — `vue-docgen-api`'s defaults no la detectan ahí. Mi script de sync incluye un parser fallback específico para JSDoc dentro de `<script setup>`.

```vue
<script setup lang="ts">
/**
 * Botón principal del sistema. Adapta su tamaño, peso y radio a los tokens de
 * plataforma activos y soporta un estado de carga inline que deshabilita la
 * interacción mientras hay trabajo asíncrono en curso.
 *
 * @example
 * <AppButton variant="primary" :loading="saving" @click="save">Guardar</AppButton>
 */

withDefaults(
  defineProps<{
    /** Variante visual: 'primary' (acción dominante), 'ghost', 'link'. */
    variant?: 'primary' | 'ghost' | 'link';
    /** Cuando es true, reemplaza el slot por un spinner y deshabilita el botón. */
    loading?: boolean;
    /** Cuando es true, atenúa el botón y bloquea la interacción. */
    disabled?: boolean;
  }>(),
  { variant: 'primary', loading: false, disabled: false }
);

defineEmits<{
  /** Se emite cuando el usuario pulsa el botón. No se emite si está disabled. */
  click: [event: MouseEvent];
}>();

defineSlots<{
  /** Contenido del botón. */
  default: () => unknown;
}>();
</script>
```

**Reglas:**

- Descripción de 1-3 frases. Es lo que sale como `description` en el frontmatter del `.md` y como subtítulo en la página.
- Al menos un `@example` con código copy-pasteable. Se renderiza tal cual en la sección "Usage".
- Cada prop, emit y slot lleva su propio `/** ... */` de una línea.
- Los tipos union (`'primary' | 'ghost' | 'link'`) se renderizan correctamente en la tabla de props (escapados como `\|`).

### Demos en vivo

Cuando un componente se beneficia de mostrarse interactivamente, crea un fichero hermano en `apps/web/components/`:

```
apps/web/components/AppButtonDemo.vue
```

El sync script auto-detecta `<Name>Demo.vue` y inyecta una sección `## Preview` en el markdown generado, envuelta en `<ClientOnly>` (las demos llevan estado interactivo, teleports, gestos — no SSR-ean limpio).

Patrón:

```vue
<script setup lang="ts">
import { AppButton } from '@synkos/ui';
const code = `<AppButton variant="primary">Continue</AppButton>`;
</script>

<template>
  <DocsComponentDemo :code="code">
    <AppButton variant="primary">Continue</AppButton>
  </DocsComponentDemo>
</template>
```

**Cuándo crear demo:**

- ✅ Acciones (botones, segments)
- ✅ Inputs (text, OTP, password)
- ✅ Listas (rows, sections, dividers)
- ✅ Feedback (spinners, progress, empty states)
- ✅ Overlays standalone (bottom sheets, drawers)

**Cuándo no:**

- ❌ Layouts que requieren router/Pinia/AuthLayout context (`MainLayout`, `AuthLayout`, `SynkosApp`)
- ❌ Wrappers que solo tienen sentido con hijos específicos (`AppPage`, `AuthFieldGroup`)
- ❌ Componentes integrados en flujos (`LegalBottomSheet`, `AuthFeedback`)

Sin demo = la página de docs sale con descripción + props + ejemplo de uso, sin sección de "Preview". Es correcto y deliberado.

`DocsComponentDemo.vue` es un wrapper común que renderiza el preview con fondo a cuadros (para mostrar transparencia), el código debajo y un botón "Copy code".

### Silhouettes (catálogo visual)

`/docs/components` es un catálogo visual: cards agrupadas por categoría con una "silueta" (forma minimalista en CSS puro) representando el componente. Estilo PrimeVue/MUI.

Las siluetas viven en un solo archivo `apps/web/components/ComponentSilhouette.vue` con un `v-if`/`v-else-if` por componente. Reusan primitivas CSS:

| Primitiva              | Uso                                                                               |
| ---------------------- | --------------------------------------------------------------------------------- |
| `.primitive--pill`     | Botón                                                                             |
| `.primitive--card`     | Lista (rows + dividers)                                                           |
| `.primitive--ring`     | Spinners y progress circular                                                      |
| `.primitive--segments` | SegmentControl                                                                    |
| `.primitive--otp`      | OTP cells                                                                         |
| `.primitive--field`    | Input field                                                                       |
| `.phone`               | Layouts (con `.phone__chrome`, `.phone__tabs`, `.phone__sheet`, `.phone__drawer`) |

Cuando añadas un componente:

- **Visual distinto** de los existentes → añade un `v-else-if name === 'NewComponent'` con su forma
- **Visual similar** a uno existente → omite, el catalog usa el fallback (`.primitive--fallback`)

`ComponentsCatalog.vue` lee `assets/generated/components.manifest.json` en runtime y produce el grid agrupado por categoría con cards que linkean a `/docs/components/<slug>`.

### El comando `pnpm sync:docs`

Pipeline:

```
1. extractComponents()
   ├─ Lee packages/synkos-ui/src/index.ts y synkos-client/src/index.ts
   ├─ Encuentra exports `.vue` (regex sobre el index.ts)
   ├─ Para cada uno, ejecuta vue-docgen-api
   ├─ Si no captura description, parser fallback lee JSDoc del <script setup>
   ├─ Si existe `<Name>Demo.vue` en apps/web/components/, inyecta sección Preview
   ├─ Renderiza markdown con `templates.mjs`
   ├─ Borra y rescribe content/en/docs/components/
   └─ Genera assets/generated/components.manifest.json

2. extractApi()
   ├─ Bootstrap TypeDoc para cada paquete
   ├─ Itera reflections, agrupa por categoría
   ├─ Excluye Vue components (van a la página de components)
   ├─ Renderiza markdown por categoría con `templates.mjs`
   └─ Genera assets/generated/api.manifest.json

3. Reporta:
   [sync:docs] → 22 component pages
   [sync:docs] → 7 API category pages (65 symbols)
   [sync:docs] done in 1.3s
```

**Tiempo de ejecución:** ~1.3s típico.

**Triggers:**

- Manual: `pnpm sync:docs` desde la raíz
- Automático: `prebuild` script de `apps/web/package.json` (corre antes de `nuxt build`)
- En CI: como verificación (ver siguiente sección)

---

## i18n (EN + ES)

Estrategia bilingüe parcial:

| Tipo de contenido                                             | EN  | ES                         |
| ------------------------------------------------------------- | --- | -------------------------- |
| Landing                                                       | ✅  | ✅                         |
| Blog                                                          | ✅  | ✅                         |
| Guías conceptuales (`/docs/getting-started`, `/docs/guide/*`) | ✅  | ✅                         |
| Componentes auto-generados (`/docs/components/*`)             | ✅  | ❌ → fallback EN con aviso |
| API auto-generada (`/docs/api/*`)                             | ✅  | ❌ → fallback EN con aviso |

Cuando un usuario en `/es/docs/components/...` accede a una página solo disponible en EN, `pages/docs/[...slug].vue` detecta el caso y:

1. Carga el `.md` desde la colección `en_docs`
2. Renderiza un banner _"Nota: esta sección solo está disponible en inglés"_

La razón: los JSDoc están en inglés. Traducirlos a ES y mantenerlos sincronizados sería overhead sin ROI. Las guías escritas a mano sí se traducen.

---

## Despliegue (Railway)

### Setup inicial

En la UI de Railway, crear un nuevo servicio desde el repo `synkos`:

| Setting         | Valor                   |
| --------------- | ----------------------- |
| Root Directory  | `/` (raíz del monorepo) |
| Dockerfile Path | `apps/web/Dockerfile`   |
| Custom Domain   | `synkos.dev`            |

Variables de entorno:

```
NUXT_PUBLIC_SITE_URL=https://synkos.dev
NUXT_PUBLIC_GITHUB_REPO=https://github.com/synkos/synkos
```

### El Dockerfile

Multi-stage para minimizar la imagen final:

```dockerfile
# 1. deps — instala solo lo que apps/web necesita
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter web...

# 2. build — compila Nuxt
FROM node:20-alpine AS build
COPY --from=deps /repo/node_modules ./node_modules
COPY apps/web ./apps/web
RUN pnpm --filter web build  # ← incluye prebuild → sync:docs

# 3. runtime — solo el output del SSR + Node
FROM node:20-alpine AS runtime
COPY --from=build /repo/apps/web/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

El build context **debe** ser la raíz del monorepo (no `apps/web/`) porque el Dockerfile copia `pnpm-lock.yaml`, `pnpm-workspace.yaml` y los workspace packages.

---

## Integración en el workflow del monorepo

La integración tiene 5 piezas, cada una con un rol específico:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                                                               │
│  Editas un componente Vue o un index.ts                                       │
│                          │                                                    │
│                          ▼                                                    │
│  [1] Hook PostToolUse ──────▶ Aviso amarillo en consola                       │
│                                                                               │
│                          │                                                    │
│                          ▼                                                    │
│  [2] plan-task post-checklist ──▶ Claude propone pnpm sync:docs               │
│                                                                               │
│                          │                                                    │
│                          ▼                                                    │
│  [3] sync-docs.yaml workflow ──▶ Ejecutas, regeneras, verificas               │
│                                                                               │
│                          │                                                    │
│                          ▼                                                    │
│  [4] push-git.yaml ──────────▶ Stagea source + docs + manifests + changeset   │
│                                  todos en el mismo commit                     │
│                                                                               │
│                          ▼                                                    │
│  [5] CI (.github/workflows/ci.yml) ──▶ Si sync:docs produce diff, falla       │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Cuándo se ejecuta `sync:docs`

| Trigger                                           | Mecanismo                             | Resultado                     |
| ------------------------------------------------- | ------------------------------------- | ----------------------------- |
| Editas un `.vue` exportado                        | Hook + Claude propone                 | Tú ejecutas manualmente       |
| Editas `packages/synkos-{ui,client}/src/index.ts` | Hook + Claude propone                 | Tú ejecutas manualmente       |
| Build de Railway                                  | `prebuild` en `package.json`          | Automático antes del build    |
| PR / push a main                                  | CI step "Verify docs are in sync"     | Validación: falla si hay diff |
| Tarea Compleja con cambios en componentes         | `plan-task.yaml` spawnea `documenter` | Lo ejecuta el agente          |

### CI / GitHub Actions

`.github/workflows/ci.yml` añade dos pasos al final del job:

```yaml
- name: Verify docs are in sync with source
  run: |
    pnpm sync:docs
    if ! git diff --quiet -- apps/web/content/en/docs/components apps/web/content/en/docs/api apps/web/assets/generated; then
      echo "::error::Docs are out of sync with package source."
      echo "::error::Run 'pnpm sync:docs' locally and commit the regenerated files."
      git --no-pager diff -- apps/web/content/en/docs/components apps/web/content/en/docs/api apps/web/assets/generated
      exit 1
    fi

- name: Build web (synkos.dev)
  run: pnpm --filter web build
```

**Efecto:** un PR no puede mergearse si las docs en `apps/web/content/en/docs/{components,api}/` están desincronizadas del código fuente actual. Mismo principio que el sistema de changesets — el autor debe haberlas regenerado y commiteado.

### Hook PostToolUse

`.claude/settings.json` define un hook que se dispara después de cada `Edit` o `Write`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "node .claude/hooks/check-docs-sync.mjs" }]
      }
    ]
  }
}
```

`.claude/hooks/check-docs-sync.mjs` lee el JSON con el path del archivo editado y, si matchea uno de los patrones-trigger, imprime un aviso amarillo:

```
[sync:docs reminder] packages/synkos-ui/src/components/actions/AppButton.vue was edited.
  Run pnpm sync:docs before commit so apps/web docs stay in sync.
  See .claude/workflows/sync-docs.yaml for the full flow.
```

**Triggers:**

- `packages/synkos-ui/src/components/**/*.vue`
- `packages/synkos-client/src/{vue/components,navigation/layouts}/**/*.vue`
- `packages/synkos-client/src/vue/SynkosApp.vue`
- `packages/synkos-{ui,client}/src/index.ts`

El hook es informativo; no bloquea ni ejecuta nada. Su propósito es que **tú** (humano) recuerdes el siguiente paso. La validación dura es CI.

### Agente `documenter`

`.claude/agents/documenter.md` define un sub-agente que el orquestador (`plan-task.yaml`) spawnea cuando una tarea Compleja involucra:

- Cambios en `packages/synkos-{ui,client}/src/index.ts`
- Cambios en componentes `.vue` exportados
- Componentes nuevos

Su proceso (7 pasos):

1. **Clasifica** el cambio (cambia index.ts, modifica componente, añade componente, combinación)
2. **Actualiza CLAUDE.md raíz** si cambió la API pública (secciones "Public API summary")
3. **Verifica/añade JSDoc** en cada `.vue` modificado o nuevo
4. **Crea demo** (`apps/web/components/<Name>Demo.vue`) si el componente es standalone-friendly
5. **Extiende silhouette** en `ComponentSilhouette.vue` si el visual es distinto
6. **Ejecuta** `pnpm sync:docs`
7. **Verifica** el diff de los archivos regenerados — solo deben cambiar los componentes tocados

Reporta al orquestador qué hizo y qué no necesitó cambios.

### Workflow `sync-docs.yaml`

`.claude/workflows/sync-docs.yaml` es la procedure step-by-step para regenerar y commitear docs (espejo de `sync-templates.yaml`). Fases:

| Fase           | Acción                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **regenerate** | `pnpm sync:docs`                                                                                               |
| **verify**     | revisar diff — solo cambios esperados, header AUTO-GENERATED intacto                                           |
| **pre-commit** | stagear source + docs + manifests + (si aplica) changeset, todo junto                                          |
| **commit**     | mensaje refleja el cambio FUENTE, no la regeneración (`feat(synkos-ui): add AppToggle`, no `docs: regenerate`) |
| **push**       | delega en `push-git.yaml`                                                                                      |

Reglas críticas:

- **Nunca commitear solo docs sin la fuente que las produjo** — significa que se editaron a mano
- **Generated files llevan header `<!-- AUTO-GENERATED -->`** — si lo pierden, el script regresó

### Workflow `push-git.yaml` (cómo afecta)

El `package-impact-map` ahora incluye 4 reglas para `apps/web/`:

```yaml
'apps/web/content/en/docs/components/**':
  side-effect: AUTO-GENERATED. Reject manual edits.

'apps/web/content/en/docs/api/**':
  side-effect: same — never hand-edit.

'apps/web/assets/generated/**':
  side-effect: regenerated by sync:docs.

'apps/web/**':
  bump: none — apps/web/ never publishes to npm.
```

Y la `pre-commit phase` añade un paso:

> Si los cambios tocan `packages/synkos-{ui,client}/src/components/**` o exports en `index.ts` — ejecuta `pnpm sync:docs` ANTES de stagear, e incluye los archivos regenerados en el mismo commit.

---

## Casos de uso paso a paso

### A) Editas un componente existente (cambio de prop, JSDoc, behavior)

1. Editas `packages/synkos-ui/src/components/actions/AppButton.vue`
2. Hook PostToolUse imprime aviso amarillo
3. Claude (post-checklist item 2) propone `pnpm sync:docs`
4. Ejecutas: `pnpm sync:docs`
5. Verificas el diff en `apps/web/content/en/docs/components/app-button.md`
6. Si todo bien: commit con `push-git.yaml` (stage source + .md + manifest)
7. Si la API pública cambió: changeset minor o major
8. CI valida `sync:docs` no produce más diff → ✅

### B) Añades un componente nuevo

1. Creas `packages/synkos-ui/src/components/forms/AppToggle.vue` con JSDoc
2. Lo añades a `packages/synkos-ui/src/index.ts`
3. Hook avisa
4. Claude (post-checklist item 2) propone:
   - JSDoc verificado ✓
   - Crear `apps/web/components/AppToggleDemo.vue` (es un input → standalone-friendly)
   - Extender `ComponentSilhouette.vue` con un `v-else-if` si el visual es distinto
5. Ejecutas `pnpm sync:docs` → 23 component pages (+1)
6. Verificas en dev: `/docs/components/app-toggle` aparece, catálogo muestra la card
7. Commit con `push-git.yaml` + changeset minor para `@synkos/ui`
8. CI ✓ → merge → release flow versiona `@synkos/ui`

### C) Editas una guía hand-written

1. Editas `apps/web/content/en/docs/guide/auth.md`
2. (No hay JSDoc, no hay sync:docs — solo es contenido)
3. Verificas en dev: `/docs/guide/auth` se actualiza con HMR
4. Commit con `push-git.yaml`. **No requiere changeset** (apps/web no publica en npm)
5. CI build pasa, deploy a Railway al merge a main

### D) Solo cambias el landing o un componente UI de la web

1. Editas `apps/web/components/landing/Hero.vue`
2. (No es componente del framework, no triggers)
3. Commit, push, deploy. Sin changeset.

---

## Troubleshooting

**`pnpm sync:docs` falla con "could not parse Component"**

El JSDoc del componente tiene un error de sintaxis o falta el `<script setup>`. Lee el log para identificar el archivo y corrige. La descripción del componente debe ir DENTRO de `<script setup>`, no como comentario HTML.

**CI falla con "Docs are out of sync"**

Olvidaste ejecutar `pnpm sync:docs` después de editar un componente. Localmente: `pnpm sync:docs` → `git add` los archivos regenerados → `git commit --amend` (o un commit nuevo) → `git push`.

**Hydration mismatch en `/docs/components/<name>`**

Probablemente el componente usa Teleport, gestos o una API de browser que no SSR-ea limpio. Las demos ya van envueltas en `<ClientOnly>` automáticamente — si ves esto en una página que NO es de un componente con demo, revisa el resto de tu Vue (puede ser otro componente).

**`AppButtonDemo` no aparece la sección Preview**

Comprueba que el archivo se llama exactamente `AppButtonDemo.vue` (PascalCase + sufijo `Demo`) y está directamente en `apps/web/components/`. El sync script busca `<exportName>Demo.vue`.

**El `<title>` de una página de docs sale como "Synkos Docs" en lugar del título del componente**

El frontmatter del `.md` no es la primera línea. Es probable que un comentario HTML quedó antes que `---`. El sync script siempre debería emitir frontmatter primero — si no, revisa `templates.mjs`.

**`/docs/components/` no muestra cards**

`assets/generated/components.manifest.json` no existe o está vacío. Ejecuta `pnpm sync:docs`.

**Quiero cambiar la categorización de un componente en el catálogo**

Edita `apps/web/scripts/extract-components.mjs` → función `categorize(absolutePath)`. Las categorías se infieren del path en `packages/`. Para añadir una categoría nueva, añade el match aquí Y en `CATEGORY_ORDER` de `apps/web/components/ComponentsCatalog.vue` Y en `categoryOrder` de `apps/web/scripts/extract-components.mjs`.

**Las descripciones de los componentes salen vacías ("No description yet")**

Falta JSDoc en el componente fuente. Edita el `<script setup>`, añade el bloque `/** ... */` como en la sección [Convención JSDoc](#convención-jsdoc), y re-ejecuta `pnpm sync:docs`.

---

## Referencias

- Workflow `sync-docs`: [`.claude/workflows/sync-docs.yaml`](../.claude/workflows/sync-docs.yaml)
- Workflow `push-git`: [`.claude/workflows/push-git.yaml`](../.claude/workflows/push-git.yaml)
- Workflow `plan-task`: [`.claude/workflows/plan-task.yaml`](../.claude/workflows/plan-task.yaml)
- Agente `documenter`: [`.claude/agents/documenter.md`](../.claude/agents/documenter.md)
- Hook `check-docs-sync`: [`.claude/hooks/check-docs-sync.mjs`](../.claude/hooks/check-docs-sync.mjs)
- CI: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Sección "Documentation pipeline" en CLAUDE.md raíz: [`CLAUDE.md`](../CLAUDE.md#documentation-pipeline-appsweb)
