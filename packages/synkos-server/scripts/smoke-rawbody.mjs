// Smoke test for issue #6: the framework body parser must populate
// `req.rawBody` so route handlers can validate webhook HMAC signatures
// against the bytes the provider signed (re-stringifying the parsed JSON
// is not byte-equal). Boots `buildApp` in-process and posts a JSON payload
// to a custom module that echoes the rawBody length.
//
// Run with: node scripts/smoke-rawbody.mjs

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const { buildApp } = require('../dist/index.cjs');
const express = require('express');
const http = require('node:http');

const echoRouter = express.Router();
echoRouter.post('/echo', (req, res) => {
  const rawBody = req.rawBody;
  res.json({
    success: true,
    data: {
      hasRawBody: Buffer.isBuffer(rawBody),
      rawBodyLength: rawBody?.length ?? null,
      parsedKeys: Object.keys(req.body ?? {}),
    },
  });
});

const app = buildApp({
  modules: [{ path: '/test', router: echoRouter }],
  disableCoreModules: ['/auth', '/users', '/account', '/usernames', '/notifications'],
});

const server = http.createServer(app);
await new Promise((res) => server.listen(0, res));
const port = server.address().port;

const payload = JSON.stringify({ event: 'webhook.test', id: 42 });

const got = await new Promise((resolve, reject) => {
  const req = http.request(
    {
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/test/echo',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    },
    (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }
  );
  req.on('error', reject);
  req.write(payload);
  req.end();
});

server.close();

console.log('response:', got.status, got.body);

const parsed = JSON.parse(got.body);
const expectedLen = Buffer.byteLength(payload);

if (
  got.status !== 200 ||
  parsed.data.hasRawBody !== true ||
  parsed.data.rawBodyLength !== expectedLen
) {
  console.error('FAIL — rawBody not captured correctly');
  console.error(`  expected length=${expectedLen}, got length=${parsed.data.rawBodyLength}`);
  process.exit(1);
}

console.log(
  `OK — rawBody captured (${parsed.data.rawBodyLength} bytes), parsed JSON also available`
);
