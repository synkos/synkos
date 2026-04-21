/**
 * Contract that every storage adapter must implement.
 *
 * The core only depends on this interface — never on a concrete provider.
 * Projects provide their implementation via setStorageAdapter() in bootstrap/adapters.ts.
 *
 * Key generation (e.g. "avatars/{userId}/{uuid}.jpg") is the caller's responsibility.
 * The adapter only stores bytes at a given key and returns the public URL.
 */
export interface StoragePort {
  /**
   * Store a file at the given key and return its public URL.
   * @param key       Object path within the bucket (e.g. "avatars/abc/xyz.jpg")
   * @param buffer    Raw file bytes
   * @param contentType MIME type (e.g. "image/jpeg")
   */
  upload(key: string, buffer: Buffer, contentType: string): Promise<UploadedAsset>;

  /**
   * Delete an object by its storage key.
   * Implementations should be idempotent — deleting a non-existent key must not throw.
   */
  delete(key: string): Promise<void>;
}

export interface UploadedAsset {
  /** Publicly accessible URL (CDN-fronted in production). */
  url: string;
  /** Storage key / object path — keep this for future delete operations. */
  key: string;
}
