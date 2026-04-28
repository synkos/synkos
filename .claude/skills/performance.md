# Skill: Performance

> **Scope**: Principalmente backend (Node/Express). Los principios de async y paralelismo aplican también al frontend.

## Principios universales

- Nunca bloquear el event loop
- Preferir async I/O
- Ejecutar operaciones independientes en paralelo
- Mover trabajo pesado fuera del request path
- Minimizar el footprint de memoria

---

## Base de datos

- Seleccionar solo los campos necesarios — nunca fetch el registro completo si solo necesitas 3 campos
- Indexar todo campo que se filtra o ordena frecuentemente
- Evitar full table scans — los filtros deben usar índices
- Usar índices compuestos para queries con múltiples campos o paginación
- Ejecutar queries independientes con `Promise.all()`, nunca await secuencial

---

## Caché

- Cachear solo operaciones de lectura
- TTL corto (≤ 5 minutos para datos de usuario)
- Siempre invalidar caché en escrituras
- Keys consistentes: `{zona}:{entidad}:{id}`

---

## Request path

- Sin operaciones CPU-intensivas
- Sin llamadas externas inline (email, storage, etc.)
- Sin crypto síncrono
- La respuesta debe ser rápida y determinista

---

## Background jobs

- Usar cola para:
  - emails
  - procesamiento de archivos
  - cómputo pesado
- Los request handlers solo encolan — no procesan

---

## Archivos

- Siempre validar tamaño máximo
- Validar MIME types
- Procesamiento de archivos grandes: siempre async (cola)

---

## Concurrencia

- Nunca await secuencial si las operaciones son independientes
- Preferir batching sobre múltiples queries individuales

---

## Métricas a monitorear

- Duración de requests
- Latencia de DB (alertar si >100ms)
- Cache hit/miss ratio
- Profundidad de la cola de jobs

---

## Anti-Patterns

- Queries sin filtros indexados
- Awaits secuenciales en operaciones independientes
- Lógica pesada en controllers
- TTL largo en datos mutables
- Procesamiento inline de email/archivos en el request handler
- Fetch de registros completos cuando solo se necesitan algunos campos

---

## Checklist

- Queries filtran por campos indexados
- Operaciones paralelizables usan `Promise.all`
- Trabajo pesado movido a cola
- Caché en hot paths de lectura
- Sin operaciones bloqueantes en el request flow
- Solo campos necesarios seleccionados en queries
