export { createApp, buildApp } from './bootstrap/app.factory';
export type { AppConfig, BodyParserOptions } from './bootstrap/app.factory';

// Side-effect: augments the global Express.Request namespace with `rawBody`.
import './types/express-augmentation';
export { startWorker } from './bootstrap/worker.factory';
export type { WorkerConfig } from './bootstrap/worker.factory';
export { wireAdapters } from './bootstrap/wire-adapters';
