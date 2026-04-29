---
'@synkos/client': patch
---

`setupSynkosRouter` auth guard now respects explicit `meta.requiresAuth: true`.

Routes under `/auth/*` are still treated as public by default (back-compat), but a
route that explicitly declares `meta: { requiresAuth: true }` is now correctly
treated as protected even if its path lives under `/auth/*`. This unblocks OAuth
callback routes mounted under `/auth/<provider>/callback`, which previously got
silently rewritten to the home route by the guard before the callback page could run.

No change for apps that did not declare `meta.requiresAuth` — the path heuristic is
preserved as the fallback.
