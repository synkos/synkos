import type { Document, Types } from 'mongoose';
import { Schema } from 'mongoose';
import { defineModel } from '@/utils/define-model';

export interface IDeviceInfo {
  platform?: string;
  deviceId?: string;
  deviceName?: string;
}

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  deviceInfo: IDeviceInfo;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    deviceInfo: {
      platform: String,
      deviceId: String,
      deviceName: String,
    },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

// MongoDB TTL: auto-delete expired tokens from the collection
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = defineModel<IRefreshToken>('RefreshToken', RefreshTokenSchema);
