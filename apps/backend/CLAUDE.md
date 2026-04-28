# Backend — Convenciones de desarrollo

> Cargado automáticamente cuando trabajas en `apps/backend/`. Complementa el CLAUDE.md raíz.

## Stack

- Node.js + Express + TypeScript (commonjs)
- @synkos/server — `createApp`, `startWorker`, `wireAdapters`
- zod — validación de todos los inputs
- vitest — tests de integración
- Arquitectura hexagonal: módulos, adaptadores, puertos, eventos de dominio

---

## Estructura del proyecto

```
src/
├── server.ts              ← entry point HTTP (llama a createApp + wireAdapters)
├── worker.ts              ← entry point worker de background jobs
├── config/
│   └── env.ts             ← variables de entorno validadas con zod (única fuente)
└── bootstrap/
    ├── adapters.ts        ← registro de adaptadores (DB, cache, queues, etc.)
    ├── modules.ts         ← registro de módulos de dominio (rutas)
    ├── extensions.ts      ← middleware global (CORS, body-parser, etc.)
    ├── jobs.ts            ← definición y registro de background jobs
    ├── listeners.ts       ← suscriptores a domain events
    └── startup.ts         ← lógica de arranque (migraciones, health checks, seed)
```

Cada módulo de dominio vive en su carpeta y sigue la estructura:

```
src/modules/<nombre>/
├── <nombre>.routes.ts     ← endpoints: solo define rutas y middleware
├── <nombre>.controller.ts ← valida input con zod, llama al servicio, formatea respuesta
├── <nombre>.service.ts    ← lógica de negocio y acceso a datos
└── <nombre>.schema.ts     ← schemas zod reutilizables del módulo
```

---

## Reglas de implementación

### Capas

- **Routes**: solo define endpoints y middleware de ruta (auth guard, rate limit). Sin lógica.
- **Controller**: valida input con zod, extrae identidad del contexto autenticado, llama al service. Sin lógica de negocio.
- **Service**: toda la lógica de negocio y acceso a datos. Nunca accede a `req`/`res`.

### Validación

- Solo en el controller, con zod
- Validar: body, params, query — todo lo que llega del cliente
- Nunca validar en el service (asume que el input ya es correcto)

### Identidad y autorización

- Siempre derivar la identidad del contexto autenticado (`req.user` o similar)
- Nunca confiar en un `userId` o `ownerId` que venga del cliente
- Verificar ownership en el service (no en el controller)

### Variables de entorno

- Siempre acceder via `src/config/env.ts` (validado con zod al arrancar)
- Nunca usar `process.env` directamente en módulos

### Comunicación entre módulos

- Usar domain events (via `bootstrap/listeners.ts`) para comunicación entre módulos
- No importar el service de un módulo directamente desde otro módulo
- Si dos módulos comparten lógica: extraerla a un servicio compartido en `src/shared/`

### Background jobs

- Operaciones pesadas (emails, procesamiento de archivos, cómputo) → siempre a la cola
- El controller/service solo encola el job — nunca lo procesa inline
- Definir el job en `bootstrap/jobs.ts`

### Respuestas HTTP

- Éxito: `{ success: true, data: ... }` o `{ success: true }` para vacío
- Error: `{ success: false, error: { code: string, message: string } }`
- Usar `error.code` consistente y predecible (ej: `"USER_NOT_FOUND"`, `"INVALID_INPUT"`)

---

## Añadir un módulo nuevo

1. Crear `src/modules/<nombre>/` con los 4 archivos (routes, controller, service, schema)
2. Registrar las rutas en `bootstrap/modules.ts`
3. Si emite domain events: registrar listeners en `bootstrap/listeners.ts`
4. Si encola jobs: registrar en `bootstrap/jobs.ts`

---

## Testing

- Tests en `tests/` (integración) o junto al módulo para unit tests puntuales
- vitest con integración real — ver skill `testing` para guía completa
- Cubrir: happy path + validación de inputs + casos de error + permisos
- Resetear estado entre tests
