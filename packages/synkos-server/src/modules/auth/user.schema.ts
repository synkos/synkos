import type { Document} from "mongoose";
import { Schema } from "mongoose";

export type AuthProvider = "local" | "google" | "apple";

export interface IAuthProvider {
  provider: AuthProvider;
  providerId: string;
  email?: string;
}

export type DeletionStatus = "active" | "pending_deletion";

/**
 * Base user interface — fields owned by the core.
 *
 * Projects that need extra fields on the User document should NOT modify
 * this interface directly. Instead, use declaration merging in
 * `src/bootstrap/extensions.ts`:
 *
 * @example
 * // bootstrap/extensions.ts
 * declare module "@/modules/auth/user.schema" {
 *   interface IUser {
 *     trainerLevel?: number;
 *   }
 * }
 */
export interface IUser extends Document {
  email: string;
  displayName: string;
  username?: string;
  usernameNormalized?: string;
  usernameChangedAt?: Date;
  avatar?: string;
  passwordHash?: string;
  providers: IAuthProvider[];
  isEmailVerified: boolean;
  role: "user" | "admin";
  isActive: boolean;
  lastLoginAt?: Date;
  // Account deletion
  deletionStatus: DeletionStatus;
  deletionRequestedAt?: Date;
  deletionScheduledAt?: Date;
  // Password reset
  passwordResetCode?: string;
  passwordResetExpires?: Date;
  passwordResetAttempts?: number;
  passwordResetSentCount?: number;
  passwordResetWindowStart?: Date;
  passwordResetLastSentAt?: Date;
  // Account lockout
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  // Email verification
  emailVerificationCode?: string;
  emailVerificationExpires?: Date;
  verificationSentCount?: number;
  verificationWindowStart?: Date;
  // Push notifications
  pushTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AuthProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, enum: ["local", "google", "apple"], required: true },
    providerId: { type: String, required: true },
    email: { type: String },
  },
  { _id: false }
);

/**
 * Exported schema — allows feature modules and project-level bootstrap
 * to add fields via `userSchema.add({...})` before the model is compiled.
 *
 * Import this from `user.schema.ts`, NOT from `user.model.ts`,
 * to avoid triggering model compilation prematurely.
 */
export const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true },
    username: { type: String, trim: true, sparse: true },
    usernameNormalized: { type: String, trim: true, sparse: true, unique: true },
    usernameChangedAt: { type: Date },
    avatar: { type: String },
    passwordHash: { type: String, select: false },
    providers: [AuthProviderSchema],
    isEmailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    // Account deletion
    deletionStatus: {
      type: String,
      enum: ["active", "pending_deletion"],
      default: "active",
      index: true,
    },
    deletionRequestedAt: { type: Date },
    deletionScheduledAt: { type: Date, index: true },
    // Password reset
    passwordResetCode: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },
    passwordResetSentCount: { type: Number, default: 0, select: false },
    passwordResetWindowStart: { type: Date, select: false },
    passwordResetLastSentAt: { type: Date, select: false },
    // Account lockout
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, select: false },
    // Email verification
    emailVerificationCode: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    verificationSentCount: { type: Number, default: 0, select: false },
    verificationWindowStart: { type: Date, select: false },
    // Push notifications
    pushTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Compound index for OAuth lookups
userSchema.index({ "providers.provider": 1, "providers.providerId": 1 });
