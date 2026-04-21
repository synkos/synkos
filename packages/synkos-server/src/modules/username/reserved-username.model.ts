import type { Document} from "mongoose";
import mongoose, { Schema } from "mongoose";

export type ReservationReason = "deleted" | "changed";

export interface IReservedUsername extends Document {
  username: string;
  usernameNormalized: string;
  reservedUntil: Date | null; // null = permanent reservation
  reason: ReservationReason;
  userId?: mongoose.Types.ObjectId; // which user previously held this username
  createdAt: Date;
  updatedAt: Date;
}

const ReservedUsernameSchema = new Schema<IReservedUsername>(
  {
    username: { type: String, required: true, trim: true },
    usernameNormalized: { type: String, required: true, trim: true, index: true },
    reservedUntil: { type: Date, default: null },
    reason: { type: String, enum: ["deleted", "changed"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Fast lookup by normalized name — checked on every availability query
ReservedUsernameSchema.index({ usernameNormalized: 1, reservedUntil: 1 });

export const ReservedUsername = mongoose.model<IReservedUsername>(
  "ReservedUsername",
  ReservedUsernameSchema
);
