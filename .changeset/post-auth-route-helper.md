---
'@synkos/client': minor
---

Add `getPostAuthRoute` / `setPostAuthRoute` for post-login navigation.

Built-in fallback pages (`LoginPage`, `UsernamePickerPage`, `DeleteAccountPage`,
`ErrorNotFound`) and both router factories (`createSynkosRouter`,
`setupSynkosRouter`) now route through a single helper instead of hardcoding
`router.replace({ name: 'home' })`. The default target is the first user-declared
tab route (or `homeRouteName` in `setupSynkosRouter`), falling back to `'home'`.

This unblocks renaming the root route — apps no longer need to keep `name: 'home'`
on their landing route to avoid `No match for {"name":"home"}` after login.

User-owned auth pages can adopt the same helper:

```ts
import { getPostAuthRoute } from '@synkos/client';
await router.replace(getPostAuthRoute());
```

Use `setPostAuthRoute(...)` to override conditionally (e.g. a one-time onboarding
route on first login).
