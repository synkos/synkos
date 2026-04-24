# Guía de desarrollo

## Estructura del monorepo

```
synkos/
├── packages/          ← los paquetes que se publican en npm
│   ├── create-synkos/     CLI scaffolding
│   ├── synkos/            frontend core (Vue plugin, auth guard, config)
│   ├── synkos-ui/         librería de componentes Vue + Quasar
│   ├── synkos-server/     framework backend Express + Mongoose
│   ├── synkos-runtime/    sistema de plugins isomórfico
│   ├── synkos-utils/      utilidades zero-dep
│   └── synkos-config/     configs compartidas ESLint + TypeScript
│
├── apps/              ← apps para desarrollo y pruebas
│   ├── backend/           backend real conectado a packages/ via workspace:*
│   └── playground/        sandbox de Node.js para probar paquetes
│
└── templates/         ← código fuente de lo que genera el CLI
    ├── frontend/          app Quasar completa (el proyecto que recibirá el usuario)
    └── backend/           app Express completa (el proyecto que recibirá el usuario)
```

La clave del monorepo es que `apps/backend` usa `@synkos/server: workspace:*` — apunta directamente al código fuente del paquete. Cualquier cambio en `packages/synkos-server/src/` se refleja en el backend de desarrollo sin necesidad de publicar.

---

## Setup inicial

```bash
pnpm install

# El frontend no está en el workspace — instalar sus deps por separado
cd templates/frontend && pnpm install --ignore-workspace && cd ../..

pnpm build        # compilar todos los paquetes una vez antes de empezar
```

El build inicial es necesario para que los `dist/` de los paquetes existan y las apps puedan importarlos.

---

## Flujo de desarrollo

### Escenario A — solo trabajas en paquetes (sin front ni back)

```bash
pnpm dev
```

Lanza todos los paquetes en watch mode en paralelo. Cada vez que guardes un archivo en `packages/`, tsup o vite recompila automáticamente.

---

### Escenario B — trabajas en el backend (apps/backend)

**Terminal 1** — paquete del servidor en watch:

```bash
pnpm --filter @synkos/server dev
```

**Terminal 2** — app backend:

```bash
pnpm dev:backend
# equivale a: cd apps/backend && tsx watch --env-file=.env src/server.ts
```

Cuando modificas algo en `packages/synkos-server/src/`, tsup recompila el paquete y tsx reinicia el servidor automáticamente.

---

### Escenario C — trabajas en el frontend (templates/frontend)

**Terminal 1** — paquetes frontend en watch:

```bash
pnpm --filter synkos dev
pnpm --filter @synkos/ui dev   # en otra terminal si tocas los componentes
```

**Terminal 2** — app frontend:

```bash
pnpm dev:frontend
# equivale a: cd templates/frontend && quasar dev
```

> El `.env` de `templates/frontend` apunta a `http://localhost:3000/api/v1`. Si el backend no está corriendo, la app funciona pero las llamadas a la API fallan.

---

### Escenario D — full stack (frontend + backend juntos)

Abre 3 terminales:

```bash
# Terminal 1 — paquetes que vayas a tocar en watch mode
pnpm --filter @synkos/server dev

# Terminal 2 — backend en :3000
pnpm dev:backend

# Terminal 3 — frontend en :9000
pnpm dev:frontend
```

---

## Referencia por paquete

### `@synkos/server` — framework backend

|           |                                          |
| --------- | ---------------------------------------- |
| Ubicación | `packages/synkos-server/`                |
| Bundler   | tsup                                     |
| Watch     | `pnpm --filter @synkos/server dev`       |
| Typecheck | `pnpm --filter @synkos/server typecheck` |

**Estructura interna:**

```
src/
├── bootstrap/     createApp(), startWorker() — punto de entrada
├── modules/       módulos de dominio (auth, user, account, username, notifications)
├── adapters/      implementaciones de puertos (email, storage, cache, queue, apns, metrics)
├── ports/         interfaces (EmailPort, StoragePort…)
├── events/        sistema de eventos de dominio (coreEvents)
├── middleware/     Express middlewares (auth, rate limit, error handler…)
├── config/        baseEnvSchema — schema Zod del entorno
├── context/       contexto de request (userId, requestId)
├── types/         tipos compartidos (ModuleDefinition, AppContext…)
└── utils/         parseEnv, logger
```

**Cómo añadir un módulo nuevo:**

1. Crea `src/modules/tu-modulo/` con `model.ts`, `service.ts`, `controller.ts`, `routes.ts`, `index.ts`
2. Exporta `tuModulo: ModuleDefinition` desde `index.ts`
3. Añade el export en `src/modules/index.ts`
4. Añade el entry point en `tsup.config.ts` si necesitas que sea importable por separado:
   ```ts
   'modules/tu-modulo/index': 'src/modules/tu-modulo/index.ts'
   ```
5. Añade el export en `package.json`:
   ```json
   "./modules/tu-modulo": { "types": "...", "import": "...", "require": "..." }
   ```

---

### `synkos` — frontend core

|           |                            |
| --------- | -------------------------- |
| Ubicación | `packages/synkos/`         |
| Bundler   | tsup (ESM + CJS)           |
| Watch     | `pnpm --filter synkos dev` |

**API pública:**

- `defineAppConfig(config)` — factory con tipos para la config de la app
- `createSynkosPlugin(config)` — plugin Vue que inyecta la config
- `useAppConfig()` — composable para acceder a la config en componentes
- `createAuthGuard(options)` — navigation guard para vue-router

**Archivos:**

```
src/
├── config.ts      defineAppConfig
├── plugin.ts      createSynkosPlugin + useAppConfig
├── router.ts      createAuthGuard
├── types.ts       AppConfig, AuthGuardOptions, AuthState
└── index.ts       re-exports
```

---

### `@synkos/ui` — librería de componentes

|           |                                |
| --------- | ------------------------------ |
| Ubicación | `packages/synkos-ui/`          |
| Bundler   | Vite (lib mode, ESM only)      |
| Watch     | `pnpm --filter @synkos/ui dev` |

El watch aquí es `vite build --watch` — genera `dist/synkos-ui.js` y `dist/style.css` en cada cambio.

**Componentes disponibles:**

- `AppListRow` — fila de lista iOS con título, subtítulo, icono, badge, "coming soon"
- `AppListSection` — contenedor con header de sección
- `AppListDivider` — separador entre secciones
- `AppEmptyState` — estado vacío con icono y mensaje
- `AppPageLargeTitle` — título grande de página estilo iOS
- `SegmentControl` — control segmentado (tabs horizontales)

**Design tokens** en `src/styles/variables.scss` — disponibles en todos los componentes via `@use "variables" as *`. Para usar los tokens en un componente externo:

```vue
<style lang="scss">
@use '@synkos/ui/variables.scss' as *;

.my-class {
  color: $text-primary;
  border-radius: $radius-xl;
}
</style>
```

**Cómo añadir un componente:**

1. Crea `src/components/MiComponente.vue`
2. Expórtalo en `src/index.ts`

---

### `@synkos/utils` — utilidades

|           |                                            |
| --------- | ------------------------------------------ |
| Ubicación | `packages/synkos-utils/`                   |
| Bundler   | tsup (ESM + CJS, neutral — browser y Node) |
| Watch     | `pnpm --filter @synkos/utils dev`          |

Dos entry points:

- `@synkos/utils` — types, string, object, error (browser + Node)
- `@synkos/utils/env` — `parseEnv` con Zod (solo Node)

---

### `@synkos/runtime` — sistema de plugins

|           |                                     |
| --------- | ----------------------------------- |
| Ubicación | `packages/synkos-runtime/`          |
| Bundler   | tsup (ESM + CJS, neutral)           |
| Watch     | `pnpm --filter @synkos/runtime dev` |

API: `definePlugin`, `defineConfig`, `createRuntime` con lifecycle hooks (`onInit`, `onReady`, `onDispose`).

---

### `@synkos/config` — configuraciones compartidas

|           |                                          |
| --------- | ---------------------------------------- |
| Ubicación | `packages/synkos-config/`                |
| Bundler   | ninguno — son archivos JS/JSON estáticos |
| Watch     | no aplica                                |

No tiene script de build ni watch. Se edita directamente. Los cambios aplican al instante porque el monorepo los importa por ruta directa via `workspace:*`.

**Exports:**

- `@synkos/config/eslint` — config ESLint 9 flat config para TypeScript
- `@synkos/config/prettier` — config Prettier
- `@synkos/config/tsconfig` — tsconfig base
- `@synkos/config/tsconfig/node` — tsconfig para paquetes Node

---

### `create-synkos` — CLI

|           |                                   |
| --------- | --------------------------------- |
| Ubicación | `packages/create-synkos/`         |
| Bundler   | tsup (ESM only, platform: node)   |
| Watch     | `pnpm --filter create-synkos dev` |

El watch **no** copia los templates (el `prebuild` solo corre en `build`). Si modificas los templates mientras estás en watch, tendrás que hacer un `pnpm --filter create-synkos build` completo para que se incluyan.

**Para probar el CLI localmente sin publicar:**

```bash
pnpm --filter create-synkos build
node packages/create-synkos/dist/index.js
```

---

## Comandos raíz de referencia

| Comando             | Qué hace                                     |
| ------------------- | -------------------------------------------- |
| `pnpm build`        | Compila todos los paquetes                   |
| `pnpm dev`          | Watch mode en todos los paquetes en paralelo |
| `pnpm dev:backend`  | Arranca `apps/backend` con tsx watch         |
| `pnpm dev:frontend` | Arranca `templates/frontend` con quasar dev  |
| `pnpm typecheck`    | Typecheck en todos los paquetes              |
| `pnpm test`         | Tests en todos los paquetes                  |
| `pnpm lint`         | ESLint en todo el monorepo                   |
| `pnpm format`       | Prettier en todo el monorepo                 |
| `pnpm changeset`    | Crear un changeset para publicar             |

---

## Variables de entorno

### `apps/backend/.env`

```
NODE_ENV=development
PORT=3000
APP_NAME=synkos-dev
MONGODB_URI=<tu URI de MongoDB Atlas o local>
JWT_ACCESS_SECRET=<mínimo 32 caracteres>
JWT_REFRESH_SECRET=<mínimo 32 caracteres>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=30
CORS_ORIGINS=http://localhost:9000
RATE_LIMIT_SKIP_DEV=true
```

### `templates/frontend/.env`

```
VITE_API_URL=http://localhost:3000/api/v1
```

Ambos archivos están en `.gitignore` — nunca se suben al repositorio.

---

## Tips

**Ver los cambios de un paquete reflejados en tiempo real:**
Abre dos terminales: una con `pnpm --filter <paquete> dev` y otra con la app. No es necesario reiniciar nada manualmente.

**Typecheck rápido de un solo paquete:**

```bash
pnpm --filter @synkos/server typecheck
```

**Limpiar todos los dist/ y reinstalar:**

```bash
pnpm clean
pnpm install
pnpm build
```
