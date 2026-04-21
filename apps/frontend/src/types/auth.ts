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
  deletionScheduledAt?: string; // ISO date string
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: TokenPair;
}

export interface DeviceInfo {
  platform?: string;
  deviceId?: string;
  deviceName?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface ForgotPasswordDto {
  email: string;
  force?: boolean;
}

export interface ForgotPasswordResult {
  expiresAt: string; // ISO timestamp
  lastSentAt: string; // ISO timestamp — used to compute resend cooldown
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface OAuthDto {
  idToken: string;
  email?: string;
  displayName?: string;
  deviceInfo?: DeviceInfo;
}
