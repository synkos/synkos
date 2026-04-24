# Skill: Performance

## Core Principles

- Never block the event loop
- Prefer async I/O
- Run independent operations in parallel
- Move heavy work out of request path
- Optimize hot paths with caching
- Minimize memory footprint

---

## Database Rules

- Always use `.lean()` on read queries
- Select only required fields
- Index every frequently filtered field
- Avoid full collection scans
- Use compound indexes for pagination
- Run independent queries with `Promise.all()`

---

## Caching

- Cache only read operations
- Use short TTL (≤ 5 minutes for user data)
- Always invalidate cache on writes
- Use consistent keys: `{zone}:{entity}:{id}`

---

## Request Path Constraints

- No CPU-heavy operations
- No external calls (email, storage, etc.)
- No synchronous crypto
- Response must be fast and deterministic

---

## Background Jobs

- Use queue for:
  - emails
  - file processing
  - heavy computation
- Request handlers must only enqueue jobs

---

## File Handling

- Always enforce size limits
- Validate MIME types
- Large processing must be async (queue)

---

## Concurrency

- Never await sequentially if operations are independent
- Prefer batching over multiple queries

---

## Metrics

Track:
- request duration
- DB latency (>100ms)
- cache hit/miss
- queue depth

---

## Anti-Patterns

- Missing `.lean()` on reads
- Sequential awaits
- No DB indexes
- Heavy logic in controllers
- Long cache TTLs on mutable data
- Inline email/file processing

---

## Checklist

- Reads use `.lean()`
- Queries are indexed
- Parallelizable ops use `Promise.all`
- Heavy work moved to queue
- Cache used on hot paths
- No blocking operations in request flow