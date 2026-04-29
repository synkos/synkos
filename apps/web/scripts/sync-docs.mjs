#!/usr/bin/env node
// Orchestrator for the docs sync pipeline.
// Generates components/* and api/* pages from the package source.

import { extractComponents } from './extract-components.mjs';
import { extractApi } from './extract-api.mjs';

const t0 = performance.now();

console.log('[sync:docs] extracting components from @synkos/ui + @synkos/client...');
const components = await extractComponents();
console.log(`[sync:docs]   → ${components.length} component pages`);

console.log('[sync:docs] extracting API via TypeDoc...');
const api = await extractApi();
console.log(
  `[sync:docs]   → ${api.length} API category pages (${api.reduce((sum, c) => sum + (c.count ?? 0), 0)} symbols)`
);

const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
console.log(`[sync:docs] done in ${elapsed}s`);
