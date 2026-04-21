# @synkos/config

Shared ESLint, Prettier, and TypeScript configs for the Synkos ecosystem.

## Install

```bash
pnpm add -D @synkos/config
```

## ESLint (ESLint 9 flat config)

```js
// eslint.config.js
import synkosConfig from '@synkos/config/eslint';

export default [...synkosConfig];
```

## Prettier

```js
// prettier.config.js
import synkosConfig from '@synkos/config/prettier';

export default { ...synkosConfig };
```

## TypeScript

```json
// tsconfig.json (base for all packages)
{ "extends": "@synkos/config/tsconfig/base.json" }

// tsconfig.json (Node.js packages)
{ "extends": "@synkos/config/tsconfig/node.json" }
```
