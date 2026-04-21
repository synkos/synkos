# Synkos

A fullstack framework ecosystem for building mobile apps with **Quasar + Vue 3 + Capacitor** on the frontend and **Express + Mongoose** on the backend.

```bash
pnpm create synkos
```

---

## What you get

When you scaffold a project, Synkos gives you a production-ready codebase with:

- **Frontend** — Quasar 2 + Vue 3 + Pinia + Capacitor 8. JWT auth, push notifications, biometrics, i18n (en/es), iOS-styled dark UI.
- **Backend** — Express 5 + Mongoose 9 + Zod 4. Auth (JWT + refresh), user/account/notifications modules, adapters for email, storage, cache, queue, APNs, metrics.
- **Fullstack** — both, wired together with matching env vars.

## Templates

| Template | Description |
|---|---|
| `fullstack` | frontend + backend |
| `frontend` | Quasar + Vue 3 + Capacitor only |
| `backend` | Express + Mongoose + @synkos/server only |

## Packages

| Package | Description |
|---|---|
| [`create-synkos`](./packages/create-synkos/) | CLI scaffolder (`pnpm create synkos`) |
| [`synkos`](./packages/synkos/) | Frontend core — `defineAppConfig`, `createSynkosPlugin`, `createAuthGuard` |
| [`@synkos/ui`](./packages/synkos-ui/) | Component library — iOS-styled Vue 3 + Quasar components |
| [`@synkos/server`](./packages/synkos-server/) | Backend framework — Express + Mongoose + adapters |
| [`@synkos/runtime`](./packages/synkos-runtime/) | Shared plugin/lifecycle system (isomorphic) |
| [`@synkos/utils`](./packages/synkos-utils/) | Zero-dep utilities — types, string, object, error, env |
| [`@synkos/config`](./packages/synkos-config/) | Shared ESLint, Prettier, TypeScript configs |

## Monorepo structure

```
synkos/
├── packages/
│   ├── create-synkos/       # CLI
│   ├── synkos/              # frontend core
│   ├── synkos-ui/           # @synkos/ui component library
│   ├── synkos-server/       # @synkos/server backend framework
│   ├── synkos-runtime/      # @synkos/runtime
│   ├── synkos-utils/        # @synkos/utils
│   └── synkos-config/       # @synkos/config
├── templates/
│   ├── frontend/
│   └── backend/
└── apps/
    └── playground/          # development sandbox
```

## Development

```bash
pnpm install
pnpm build       # build all packages
pnpm dev         # watch mode
pnpm typecheck   # type-check all
```

## Contributing

1. Fork and create a branch.
2. Make changes and add a changeset: `pnpm changeset`
3. Open a PR — CI runs lint, typecheck, build.

Versioning is managed by [Changesets](https://github.com/changesets/changesets). Each package is versioned independently.

## License

MIT

---

<!-- Original spec below — kept for reference during active development -->
- Developer Experience (DX)
- Modularidad y mantenibilidad

---

# 🧭 VISIÓN

Synkos no es solo un framework, sino un **ecosistema completo**:

- Framework frontend
- Framework backend
- Librerías compartidas
- CLI profesional
- Sistema de templates
- Tooling unificado

---

# 🏢 ORGANIZACIÓN

## npm
- Scope: `@synkos/*`

## GitHub
- Organización: `synkos`
- Repositorio principal: `synkos` (monorepo)

---

# 📦 ARQUITECTURA MONOREPO

Gestión mediante:
- `pnpm workspaces`

Estructura:

```
synkos/
├─ packages/
│ ├─ create-synkos # CLI scaffolding
│ ├─ synkos # framework frontend core
│ ├─ @synkos/ui # librería de componentes
│ ├─ @synkos/server # framework backend
│ ├─ @synkos/utils # utilidades compartidas
│ ├─ @synkos/config # config compartida (eslint, ts, etc.)
│ └─ @synkos/runtime # runtime común (plugins, hooks)
│
├─ apps/
│ └─ playground # entorno de pruebas
│
├─ templates/ # templates CLI
│ ├─ frontend/
│ ├─ backend/
│ └─ fullstack/
│
├─ .changeset/
├─ pnpm-workspace.yaml
├─ package.json
└─ tsconfig.base.json
```


---

# ⚙️ TOOLING BASE

- Lenguaje: TypeScript (ESM-first)
- Bundler: `tsup`
- Linting: `eslint`
- Formatting: `prettier`

Opcional (recomendado):
- `lint-staged`
- `husky`

---

# 📐 ESTÁNDARES TÉCNICOS

## Módulos
- ESM por defecto
- Compatibilidad opcional CJS

## Export maps (obligatorio)

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

Tipado
- Tipos incluidos (.d.ts)
- Strict mode activado

# 🧱 FRAMEWORK FRONTEND

## Stack base
- Quasar
- Capacitor

## Objetivos
- APP Mobile
- Integración nativa con backend
- Configuración mínima (zero-config por defecto)

## Características
- Auto-imports (components, composables, utils)
- Sistema de plugins
- Configuración mediante `synkos.config.ts`
- Dev server basado en Vite
- File-based routing (opcional pero recomendado)
- SSR-ready (futuro, arquitectura preparada)
- Integración directa con Capacitor para builds móviles

## Arquitectura interna

(POR DEFINIR, ADAPTANDOSE AL PROYECTO DE FRONTEND YA CREADO)

```
frontend/
├─ app/ # entry
├─ components/ # auto-import
├─ pages/ # routing (file-based)
├─ composables/ # lógica reutilizable
├─ plugins/ # plugins synkos
├─ layouts/ # layouts reutilizables
└─ assets/
```


## Configuración

```ts
// synkos.config.ts
export default defineConfig({
  app: {
    name: 'MyApp'
  },
  quasar: {},
  capacitor: {},
  plugins: []
});
```

# 🧩 FRAMEWORK BACKEND

## Stack base
- Express
- Mongoose

## Objetivos

- API estructurada y escalable
- Integración con frontend
- Modularidad

## Características
- Sistema de módulos
- Inyección de dependencias (opcional)
- Middleware configurable
- Validación centralizada

## Arquitectura interna

(POR DEFINIR, ADAPTANDOSE AL PROYECTO DE API YA CREADO)

# 🔗 RUNTIME COMPARTIDO

`@synkos/runtime`

## Responsabilidades:

- Sistema de plugins
- Hooks lifecycle
- Config loader
- Context compartido

# 🧰 CLI — create-synkos

## Objetivo
- Scaffolding profesional con DX excelente.

## Uso
```
pnpm create synkos
```

## Flujo CLI

(Todavía por definir)

## Herramientas

- `@clack/prompts` → prompts modernos
- `fs-extra` → file system
- `kolorist` → colores
- `minimist` → parsing CLI args
- `ora` → loading states (opcional)

## Responsabilidades

- Copiar templates
- Inyectar variables dinámicas (nombre proyecto, etc.)
- Instalar dependencias automáticamente
- Mostrar instrucciones claras post-creación

## CLI futura (fase 2)

```bash
synkos dev
synkos build
synkos start
synkos add <plugin>
```

---

# 📁 SISTEMA DE TEMPLATES

## Tipos

- `frontend`
- `backend`
- `fullstack`

## Requisitos

- Producción-ready
- Scripts funcionales (`dev`, `build`)
- Configuración mínima
- Buenas prácticas aplicadas

## Variables dinámicas

- `project name`
- `package name`
- `ports`
- `env config`

---

# 🔄 VERSIONADO

## Herramienta

- `changesets`

## Estrategia

- Versionado independiente por paquete
- Semver estricto
- Generación automática de changelogs
- Control manual de cambios (no automático tipo semantic-release)

---

# 🚀 PUBLICACIÓN

## Flujo manual

```bash
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

## CI/CD — GitHub Actions

Archivo: `.github/workflows/release.yml`

### Pipeline

**Trigger:**
- `push` a `main`

**Steps:**
1. checkout
2. setup pnpm
3. install deps
4. build packages
5. run tests
6. publicar npm (si hay changesets)

---

# 🧪 PLAYGROUND

Ubicación: `apps/playground`

## Objetivo

- Testing manual del framework
- Validación de nuevas features
- Sandbox de desarrollo

---

# 📦 PUBLICACIÓN EN NPM

## Paquetes

- `create-synkos`
- `synkos`
- `@synkos/ui`
- `@synkos/server`
- `@synkos/utils`
- `@synkos/runtime`
- `@synkos/config`

---

# 🧼 CALIDAD DE CÓDIGO

- ESLint obligatorio
- Prettier obligatorio
- TypeScript strict
- Conventional commits (recomendado)
- Hooks pre-commit (`husky` + `lint-staged`)

---

# ⚡ RENDIMIENTO

- Build rápido con `tsup`
- Tree-shaking completo
- Code splitting frontend
- Lazy loading (routes/components)
- Backend modular sin overhead innecesario

---

# 🧠 ESCALABILIDAD

- Arquitectura basada en módulos
- Plugins desacoplados
- Separación clara de capas
- Preparado para crecimiento horizontal

---

# 🧩 EXTENSIBILIDAD

## Sistema de plugins

- Registro dinámico
- Hooks lifecycle
- API pública estable

## Ejemplo

```ts
export default definePlugin({
  name: 'my-plugin',
  setup(ctx) {
    ctx.hook('onInit', () => {});
  }
});
```

---

# 🔐 FUTURO (NO FASE 1)

- Sistema de autenticación integrado
- CLI avanzada completa
- Deploy automatizado
- Servicios cloud (SaaS)
- Panel admin
- Testing integrado (Vitest / e2e)

---

# 📌 PRINCIPIOS CLAVE

- DX primero
- Convención sobre configuración
- Modularidad total
- Performance por defecto
- Ecosistema extensible
- Open source (MIT recomendado)