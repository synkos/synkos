import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createLogger } from "@/utils/logger";
import type { StoragePort, UploadedAsset } from "@/ports/storage.port";

const log = createLogger("storage:r2");

// ── Config ────────────────────────────────────────────────────────────────────

export interface R2AdapterConfig {
  /** Cloudflare account ID (used to build the R2 endpoint URL). */
  accountId: string;
  /** R2 API token / access key ID. */
  accessKeyId: string;
  /** R2 API token secret. */
  secretAccessKey: string;
  /** R2 bucket name. */
  bucket: string;
  /**
   * Public base URL for the bucket (CDN or public R2 URL).
   * No trailing slash. Example: "https://assets.tgc.app"
   */
  publicBaseUrl: string;
}

// ── Adapter ───────────────────────────────────────────────────────────────────

export class R2StorageAdapter implements StoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(config: R2AdapterConfig) {
    this.bucket        = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/$/, "");

    this.client = new S3Client({
      region:   "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId:     config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<UploadedAsset> {
    log.debug({ key, contentType, bytes: buffer.byteLength }, "Uploading object");

    await this.client.send(
      new PutObjectCommand({
        Bucket:      this.bucket,
        Key:         key,
        Body:        buffer,
        ContentType: contentType,
      })
    );

    return {
      url: `${this.publicBaseUrl}/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    log.debug({ key }, "Deleting object");

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key:    key,
      })
    );
  }
}
