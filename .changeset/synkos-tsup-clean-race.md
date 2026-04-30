---
'synkos': patch
---

Fix race in `tsup` build that occasionally dropped `dist/vite.d.ts` and `dist/vite.d.cts` from the published tarball (visible in `synkos@0.3.0`, where importing `synkos/vite` from a TypeScript app surfaced `Could not find a declaration file for module 'synkos/vite'`).

`tsup`'s array config runs each entry in parallel. Setting `clean: true` on any one entry races against the others — entries that finished their `.d.ts` emit before the cleaner ran got their output wiped. The published `vite.js` was on the lucky side of the race, but `vite.d.ts` lost out at publish time.

Fix is a one-liner: drop `clean: true` from inside the tsup configs and run `rm -rf dist` once via a `prebuild` script before tsup starts. Locally re-verified across five back-to-back builds — every dist tree consistently contains all four `.d.ts` / `.d.cts` files.

Also align the `vue-router` peer-dep range to `^5.0.0` to match what the rest of the workspace and every Synkos app actually uses (`^4.0.0` was a stale leftover that caused `unmet peer` warnings on every install).
