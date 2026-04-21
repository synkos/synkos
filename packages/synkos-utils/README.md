# @synkos/utils

Zero-dependency utilities for Synkos apps — works in Node.js and browser.

## Install

```bash
pnpm add @synkos/utils
```

## Modules

### Types

```ts
import type {
  Maybe, // T | null | undefined
  Nullable, // T | null
  Optional, // T | undefined
  DeepPartial,
  DeepRequired,
  Prettify,
  NonEmptyArray,
  PartialBy,
  RequiredBy,
  KeysOfType,
} from '@synkos/utils';
```

### String

```ts
import { slugify, capitalize, toPascalCase, toCamelCase, truncate, isBlank } from '@synkos/utils';

slugify('Hello World!'); // 'hello-world'
capitalize('hello'); // 'Hello'
toPascalCase('foo-bar'); // 'FooBar'
toCamelCase('foo-bar'); // 'fooBar'
truncate('Long text', 8); // 'Long tex…'
isBlank('  '); // true
```

### Object

```ts
import { pick, omit, deepMerge, isPlainObject } from '@synkos/utils';

pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
deepMerge({ a: { x: 1 } }, { a: { y: 2 } }); // { a: { x: 1, y: 2 } }
```

### Error

```ts
import { AppError, isAppError, Errors } from '@synkos/utils';

// Throw a structured error
throw Errors.notFound('User not found');
throw Errors.unauthorized('Token expired');
throw Errors.badRequest('Invalid email');

// Check in catch blocks
if (isAppError(err)) {
  res.status(err.status).json(err.toJSON());
  // { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }
}

// Create custom errors
throw new AppError(422, 'UNPROCESSABLE', 'Validation failed');
```

Available factories: `badRequest` (400), `unauthorized` (401), `forbidden` (403), `notFound` (404), `conflict` (409), `tooManyRequests` (429), `internal` (500).

### Env (Node.js only)

```ts
import { parseEnv } from '@synkos/utils/env';
import { z } from 'zod';

const env = parseEnv(
  z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
  }),
  process.env
);

// env is fully typed. Exits with a readable error if validation fails.
```
