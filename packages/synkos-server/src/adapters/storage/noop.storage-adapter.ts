import type { StoragePort, UploadedAsset } from '@/ports/storage.port';

/**
 * Noop storage adapter — default when no provider is configured.
 *
 * Upload throws 503 so callers get a clear error rather than a silent failure.
 * Delete is a no-op (nothing was ever stored).
 */
export class NoopStorageAdapter implements StoragePort {
  async upload(_key: string, _buffer: Buffer, _contentType: string): Promise<UploadedAsset> {
    throw Object.assign(new Error('Photo uploads are not available. Storage is not configured.'), {
      status: 503,
      code: 'STORAGE_NOT_CONFIGURED',
    });
  }

  async delete(_key: string): Promise<void> {
    // Nothing to delete when storage is not configured.
  }
}
