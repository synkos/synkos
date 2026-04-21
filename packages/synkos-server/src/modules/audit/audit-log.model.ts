import type { Document, Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

export type AuditEventType =
  | "name_changed"
  | "username_changed"
  | "password_changed"
  | "photo_updated"
  | "photo_removed";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  type: AuditEventType;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["name_changed", "username_changed", "password_changed", "photo_updated", "photo_removed"],
      required: true,
    },
    // Store only non-sensitive values — never store passwords here
    oldValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Efficient lookup by user + recency
AuditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
