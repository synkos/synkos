import { NoopStorageAdapter } from './noop.storage-adapter';
import type { StoragePort } from '@/ports/storage.port';

/**
 * Module-level singleton. Starts with the noop adapter so the app boots safely
 * with no storage configuration — upload attempts return 503, deletes are silent.
 *
 * Projects call setStorageAdapter() in bootstrap/adapters.ts.
 */
let adapter: StoragePort = new NoopStorageAdapter();

export function setStorageAdapter(impl: StoragePort): void {
  adapter = impl;
}

export function getStorageAdapter(): StoragePort {
  return adapter;
}
