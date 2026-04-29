---
'@synkos/client': minor
---

Eliminate the rehydration race that breaks OAuth callbacks:

- `useAuthStore().whenReady()` returns a promise that resolves the first time
  `initialize()` settles (success or recoverable failure).

- The API client awaits hydration before each request via the new
  `awaitAuthReady` hook (registered automatically by the auth store), so a
  request fired from `onMounted` of a callback page picks up the rehydrated
  bearer token instead of going out anonymous and 401-ing. A 5-second hard
  timeout prevents a stuck rehydration from blocking the API client.

User-owned callback pages no longer need their own `waitForAuth(...)` polling
loop — `getApiClient()` is now safe to call directly from `onMounted`.
