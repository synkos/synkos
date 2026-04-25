# create-synkos

## 0.2.8

### Patch Changes

- 5f58a33: pin synkos to ^0.2.0 in frontend template to ensure CLI binary is available

## 0.2.7

### Patch Changes

- 4a8fc66: update frontend template: use synkos dev ios instead of bundled dev-ios script

## 0.2.6

### Patch Changes

- 981c9a2: fix dev:ios opening App.xcodeproj instead of App.xcworkspace in Xcode

## 0.2.5

### Patch Changes

- 994b2d2: fix .npmrc not copied to generated project — npm excludes dotfiles starting with . when publishing, so .npmrc was renamed to npmrc during build and restored by scaffold

## 0.2.4

### Patch Changes

- 46ca730: add missing @capacitor/core dependency to frontend template
- 827371c: fix dev errors when running pnpm dev in a generated frontend project

## 0.2.3

### Patch Changes

- 41daa54: fix: update @synkos/server dependency in backend template to ^0.2.0

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
