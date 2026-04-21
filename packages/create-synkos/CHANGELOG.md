# create-synkos

## 0.2.2

### Patch Changes

- dfd4636: fix: strip .git dirs and un-dot dotfiles when bundling templates so npm pack includes all template files

## 0.2.1

### Patch Changes

- 8d655c5: fix: include templates directory in published npm package

## 0.2.0

### Minor Changes

- Initial public release of the Synkos framework ecosystem.
  - `create-synkos` — CLI scaffolder for fullstack, frontend, and backend projects
  - `synkos` — Frontend core: `defineAppConfig`, `createSynkosPlugin`, `useAppConfig`, `createAuthGuard`
  - `@synkos/ui` — iOS-styled Vue 3 + Quasar component library with design tokens
  - `@synkos/server` — Express 5 + Mongoose 9 backend framework with auth, user, and adapter system
  - `@synkos/runtime` — Isomorphic plugin and lifecycle hook system
  - `@synkos/utils` — Zero-dependency utilities: types, string, object, error, env
  - `@synkos/config` — Shared ESLint 9, Prettier, and TypeScript configs
