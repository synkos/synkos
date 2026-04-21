import type { IUser } from './user.model';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface RegisterEmailDto {
  email: string;
  password: string;
}

export interface LoginEmailDto {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface OAuthDto {
  idToken: string;
  displayName?: string;
  deviceInfo?: DeviceInfo;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface RefreshDto {
  refreshToken: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  platform?: string;
  deviceId?: string;
  deviceName?: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthResponse {
  user: PublicUser;
  tokens: TokenPair;
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  username?: string; // null until the user completes the username picker
  usernameChangedAt?: string; // ISO date string — used to compute change cooldown
  avatar?: string;
  isEmailVerified: boolean;
  role: string;
  providers: string[];
  deletionStatus: 'active' | 'pending_deletion';
  deletionScheduledAt?: string; // ISO date string, only present when pending_deletion
}

// ── JWT ───────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// ── Express augmentation ──────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
