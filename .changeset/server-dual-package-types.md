---
'@synkos/server': patch
---

Expose per-condition types in `package.json` exports so consumers under
`moduleResolution: "Node16" | "NodeNext"` can statically import the package
and its subpaths from a CommonJS context. Each export entry now publishes
the matching `.d.ts` for ESM importers and `.d.cts` for CJS importers, which
removes the spurious "ECMAScript module imported via require" TS1479 errors
when typechecking or building a CJS app against `@synkos/server`.
