// Smoke test for issue #1: importing the main bundle and the middleware bundle
// in the same process must not throw OverwriteModelError, even though both
// bundles register the same Mongoose models (RefreshToken, ReservedUsername).
//
// Run with: node scripts/smoke-multi-bundle.mjs

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

let mainOk = false;
let middlewareOk = false;
let error = null;

try {
  // Top-level statements in dist/index.cjs register: User (lazy), RefreshToken, AuditLog, ReservedUsername
  require('../dist/index.cjs');
  mainOk = true;
  // Top-level statements in dist/middleware/index.cjs register: RefreshToken (and possibly more)
  require('../dist/middleware/index.cjs');
  middlewareOk = true;
} catch (err) {
  error = err;
}

const mongoose = require('mongoose');
const registered = Object.keys(mongoose.models).sort();

console.log('main bundle loaded:        ', mainOk);
console.log('middleware bundle loaded:  ', middlewareOk);
console.log('mongoose.models registered:', registered);

if (error) {
  console.error('FAIL —', error.constructor.name + ':', error.message);
  process.exit(1);
}

// Sanity: at least RefreshToken should be registered (it's eager in both bundles)
if (!registered.includes('RefreshToken')) {
  console.error('FAIL — RefreshToken model not registered after loading either bundle');
  process.exit(1);
}

console.log('OK — both bundles loaded without OverwriteModelError');
