import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User, type IUser } from './user.model';
import { RefreshToken } from './refresh-token.model';
import { env } from '@/config/env';
import { getEmailAdapter } from '@/adapters/email/email.registry';
import { generateUniqueUsername } from '@/modules/username/username.service';
import { createLogger } from '@/utils/logger';
import { coreEvents } from '@/events/core-events';

const log = createLogger('auth');
import type {
  RegisterEmailDto,
  LoginEmailDto,
  OAuthDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  DeviceInfo,
  TokenPair,
  AuthResponse,
  PublicUser,
  JwtPayload,
} from './auth.types';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRES_IN = env.JWT_ACCESS_EXPIRES_IN; // "15m"
const REFRESH_TOKEN_EXPIRES_DAYS = env.JWT_REFRESH_EXPIRES_DAYS;
const MAX_FAILED_LOGIN_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 min
const MAX_OTP_ATTEMPTS = 5;

const EMAIL_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 min sliding window
const EMAIL_SEND_MAX = 3; // max emails per window per address

/**
 * Enforce per-email send-rate limit. Mutates the user document (does NOT save).
 * Throws 429 if the limit is exceeded.
 */
function checkEmailSendRate(
  user: IUser,
  countField: 'passwordResetSentCount' | 'verificationSentCount',
  windowField: 'passwordResetWindowStart' | 'verificationWindowStart'
) {
  const now = Date.now();
  const windowStart = user[windowField]?.getTime() ?? 0;

  if (now - windowStart > EMAIL_SEND_WINDOW_MS) {
    // Window expired — reset counter
    user[countField] = 1;
    (user[windowField] as Date | undefined) = new Date(now);
  } else {
    const count = (user[countField] ?? 0) + 1;
    if (count > EMAIL_SEND_MAX) {
      const err = new Error('Too many code requests. Try again later.') as Error & {
        status: number;
      };
      err.status = 429;
      throw err;
    }
    user[countField] = count;
  }
}

// ── Apple JWKS cache (24h TTL) ─────────────────────────────────────────────────
type AppleJWKSKey = { kid: string; n: string; e: string; kty: string; alg: string };
let appleJwksCache: { keys: AppleJWKSKey[]; cachedAt: number } | null = null;
const APPLE_JWKS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getApplePublicKeys(): Promise<AppleJWKSKey[]> {
  if (appleJwksCache && Date.now() - appleJwksCache.cachedAt < APPLE_JWKS_TTL_MS) {
    return appleJwksCache.keys;
  }
  const res = await fetch('https://appleid.apple.com/auth/keys');
  if (!res.ok) {
    const err = new Error('Could not fetch Apple public keys') as Error & { status: number };
    err.status = 502;
    throw err;
  }
  const jwks = (await res.json()) as { keys: AppleJWKSKey[] };
  appleJwksCache = { keys: jwks.keys, cachedAt: Date.now() };
  return jwks.keys;
}

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    usernameChangedAt: user.usernameChangedAt?.toISOString(),
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    providers: user.providers.map((p) => p.provider),
    deletionStatus: user.deletionStatus ?? 'active',
    deletionScheduledAt: user.deletionScheduledAt?.toISOString(),
  };
}

function generateAccessToken(user: IUser): string {
  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

async function generateRefreshToken(userId: string, deviceInfo?: DeviceInfo): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

  await RefreshToken.create({
    userId,
    tokenHash,
    deviceInfo: deviceInfo ?? {},
    expiresAt,
  });

  return rawToken;
}

async function issueTokenPair(user: IUser, deviceInfo?: DeviceInfo): Promise<TokenPair> {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id.toString(), deviceInfo);

  // Parse expiresIn to seconds for the client
  const expiresIn = ACCESS_TOKEN_EXPIRES_IN.endsWith('m')
    ? parseInt(ACCESS_TOKEN_EXPIRES_IN) * 60
    : parseInt(ACCESS_TOKEN_EXPIRES_IN);

  return { accessToken, refreshToken, expiresIn };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AuthService = {
  /**
   * Register a new user with email + password.
   */
  async register(dto: RegisterEmailDto): Promise<AuthResponse> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      const err = new Error('Email already registered') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const displayName = await generateUniqueUsername();

    const verificationRawCode = String(crypto.randomInt(100000, 1000000));
    const verificationCodeHash = crypto
      .createHash('sha256')
      .update(verificationRawCode)
      .digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      email: dto.email.toLowerCase().trim(),
      displayName,
      passwordHash,
      providers: [{ provider: 'local', providerId: dto.email.toLowerCase() }],
      isEmailVerified: false,
      emailVerificationCode: verificationCodeHash,
      emailVerificationExpires: verificationExpires,
    });

    // Best-effort — don't fail registration if email delivery fails
    getEmailAdapter()
      .sendEmailVerification(user.email, verificationRawCode)
      .catch((err) => log.error({ err }, 'Verification email failed to send'));

    coreEvents.emit('user:registered', {
      userId: user._id.toString(),
      email: user.email,
      provider: 'local',
    });

    const tokens = await issueTokenPair(user);
    return { user: toPublicUser(user), tokens };
  },

  /**
   * Authenticate with email + password.
   */
  async loginEmail(dto: LoginEmailDto): Promise<AuthResponse> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select(
      '+passwordHash +failedLoginAttempts +lockedUntil'
    );

    if (!user || !user.passwordHash) {
      const err = new Error('Invalid credentials') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Account disabled') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    // Check temporary lockout from too many failed attempts
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      const err = new Error(
        `Account temporarily locked. Try again in ${minutesLeft} minutes.`
      ) as Error & { status: number };
      err.status = 429;
      throw err;
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      const err = new Error('Invalid credentials') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    // Reset lockout state on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    coreEvents.emit('user:login', { userId: user._id.toString(), provider: 'local' });

    const tokens = await issueTokenPair(user, dto.deviceInfo);
    return { user: toPublicUser(user), tokens };
  },

  /**
   * Authenticate or register via Google ID token (sent from the mobile app).
   */
  async loginGoogle(dto: OAuthDto): Promise<AuthResponse> {
    if (!googleClient || !env.GOOGLE_CLIENT_ID) {
      const err = new Error('Google auth not configured') as Error & { status: number };
      err.status = 501;
      throw err;
    }

    // Accept both Web and iOS client IDs as valid audiences
    const audiences = [env.GOOGLE_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID].filter(Boolean) as string[];
    const ticket = await googleClient.verifyIdToken({
      idToken: dto.idToken,
      audience: audiences,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      const err = new Error('Invalid Google token') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by Google provider ID
    let user = await User.findOne({
      providers: { $elemMatch: { provider: 'google', providerId: googleId } },
    });

    let isNewUser = false;

    if (!user) {
      // Check if email already registered (link accounts)
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link Google provider to existing account
        user.providers.push({ provider: 'google', providerId: googleId, email });
        if (!user.isEmailVerified) user.isEmailVerified = true;
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          displayName: dto.displayName ?? name ?? email.split('@')[0],
          avatar: picture,
          providers: [{ provider: 'google', providerId: googleId, email }],
          isEmailVerified: true,
        });
        isNewUser = true;
      }
    }

    if (!user.isActive) {
      const err = new Error('Account disabled') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    user.lastLoginAt = new Date();
    await user.save();

    if (isNewUser) {
      coreEvents.emit('user:registered', {
        userId: user._id.toString(),
        email: user.email,
        provider: 'google',
      });
    }
    coreEvents.emit('user:login', { userId: user._id.toString(), provider: 'google' });

    const tokens = await issueTokenPair(user, dto.deviceInfo);
    return { user: toPublicUser(user), tokens };
  },

  /**
   * Authenticate or register via Apple identity token.
   * Apple tokens are standard JWTs — we verify using Apple's public JWKS.
   */
  async loginApple(
    dto: OAuthDto & { email?: string; displayName?: string }
  ): Promise<AuthResponse> {
    // Decode the token header to get the key ID
    const decoded = jwt.decode(dto.idToken, { complete: true });
    if (!decoded || !decoded.header.kid) {
      const err = new Error('Invalid Apple token') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    const appleKeys = await getApplePublicKeys();
    const key = appleKeys.find((k) => k.kid === decoded.header.kid);
    if (!key) {
      const err = new Error('Apple signing key not found') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    // Reconstruct the public key from JWKS
    const publicKey = crypto.createPublicKey({ key: { ...key, use: 'sig' }, format: 'jwk' });

    // Verify the token
    let applePayload: { sub: string; email?: string; email_verified?: boolean };
    try {
      applePayload = jwt.verify(dto.idToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: env.APPLE_CLIENT_ID,
      }) as typeof applePayload;
    } catch {
      const err = new Error('Apple token verification failed') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    const appleId = applePayload.sub;
    // Apple only sends email on first login — clients must cache it
    const email = applePayload.email ?? dto.email;

    if (!email) {
      const err = new Error('Email required for Apple sign-in') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    let user = await User.findOne({
      providers: { $elemMatch: { provider: 'apple', providerId: appleId } },
    });

    let isNewUser = false;

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        user.providers.push({ provider: 'apple', providerId: appleId, email });
        if (!user.isEmailVerified) user.isEmailVerified = true;
      } else {
        user = await User.create({
          email: email.toLowerCase(),
          displayName: dto.displayName ?? email.split('@')[0],
          providers: [{ provider: 'apple', providerId: appleId, email }],
          isEmailVerified: true,
        });
        isNewUser = true;
      }
    }

    if (!user.isActive) {
      const err = new Error('Account disabled') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    user.lastLoginAt = new Date();
    await user.save();

    if (isNewUser) {
      coreEvents.emit('user:registered', {
        userId: user._id.toString(),
        email: user.email,
        provider: 'apple',
      });
    }
    coreEvents.emit('user:login', { userId: user._id.toString(), provider: 'apple' });

    const tokens = await issueTokenPair(user, dto.deviceInfo);
    return { user: toPublicUser(user), tokens };
  },

  /**
   * Rotate refresh token: validate → revoke old → issue new pair.
   */
  async refresh(dto: RefreshDto): Promise<TokenPair> {
    const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      const err = new Error('Invalid or expired refresh token') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    // Revoke the used token (rotation)
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await User.findById(storedToken.userId);
    if (!user || !user.isActive) {
      const err = new Error('User not found or disabled') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    return issueTokenPair(user, dto.deviceInfo ?? storedToken.deviceInfo);
  },

  /**
   * Revoke a refresh token (logout from device).
   * Pass userId when available (from req.user) to avoid an extra DB lookup.
   */
  async logout(refreshToken: string, userId?: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await RefreshToken.updateOne(
      { tokenHash, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );

    if (userId) {
      coreEvents.emit('user:logout', { userId });
    }
  },

  /**
   * Revoke all refresh tokens for a user (logout from all devices).
   */
  async logoutAll(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );

    coreEvents.emit('user:logout_all', { userId });
  },

  /**
   * Get the current authenticated user.
   */
  async getMe(userId: string): Promise<PublicUser> {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }
    return toPublicUser(user);
  },

  /**
   * Request a password-reset OTP. Always returns success to prevent email enumeration.
   *
   * If an active (non-expired) code already exists and `force` is false, the existing
   * expiry is returned without sending a new email — avoids generating stale codes when
   * the user navigates back and re-submits the same email.
   *
   * Pass `force: true` (resend button) to always generate a fresh code.
   */
  async forgotPassword(
    dto: ForgotPasswordDto & { force?: boolean }
  ): Promise<{ expiresAt: Date; lastSentAt: Date }> {
    const RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes
    const now = new Date();

    const user = await User.findOne({ email: dto.email.toLowerCase() }).select(
      '+passwordResetCode +passwordResetExpires +passwordResetAttempts +passwordResetSentCount +passwordResetWindowStart +passwordResetLastSentAt'
    );

    if (!user) {
      // Silent — don't reveal whether the email exists. Return plausible values.
      return { expiresAt: new Date(Date.now() + RESET_TTL_MS), lastSentAt: now };
    }

    const hasActiveCode =
      !dto.force &&
      user.passwordResetCode &&
      user.passwordResetExpires &&
      user.passwordResetExpires > now;

    if (hasActiveCode) {
      // Reuse existing code — resume countdown, no new email
      return {
        expiresAt: user.passwordResetExpires!,
        lastSentAt: user.passwordResetLastSentAt ?? now,
      };
    }

    // Rate-limit new code generation per email address
    checkEmailSendRate(user, 'passwordResetSentCount', 'passwordResetWindowStart');

    // Generate a new code
    const rawCode = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    user.passwordResetCode = codeHash;
    user.passwordResetExpires = expiresAt;
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = now;
    await user.save();

    await getEmailAdapter().sendPasswordReset(user.email, rawCode);

    return { expiresAt, lastSentAt: now };
  },

  /**
   * Validate a password-reset OTP without consuming it or changing the password.
   * Increments attempt counter on failure (same brute-force protection as resetPassword).
   */
  async validateResetCode(dto: { email: string; code: string }): Promise<void> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select(
      '+passwordResetCode +passwordResetExpires +passwordResetAttempts'
    );

    const invalid = () => {
      const err = new Error('Invalid or expired code') as Error & { status: number };
      err.status = 400;
      throw err;
    };

    if (!user || !user.passwordResetCode || !user.passwordResetExpires) return invalid();
    if (user.passwordResetExpires < new Date()) return invalid();
    if ((user.passwordResetAttempts ?? 0) >= MAX_OTP_ATTEMPTS) return invalid();

    const codeHash = crypto.createHash('sha256').update(dto.code).digest('hex');
    if (codeHash !== user.passwordResetCode) {
      user.passwordResetAttempts = (user.passwordResetAttempts ?? 0) + 1;
      if (user.passwordResetAttempts >= MAX_OTP_ATTEMPTS) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
      }
      await user.save();
      return invalid();
    }
    // Code is valid — do not mutate anything
  },

  /**
   * Verify the OTP and set a new password.
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select(
      '+passwordHash +passwordResetCode +passwordResetExpires +passwordResetAttempts'
    );

    const invalid = () => {
      const err = new Error('Invalid or expired code') as Error & { status: number };
      err.status = 400;
      throw err;
    };

    if (!user || !user.passwordResetCode || !user.passwordResetExpires) return invalid();
    if (user.passwordResetExpires < new Date()) return invalid();

    // Block if already exceeded max attempts (OTP was already invalidated)
    if ((user.passwordResetAttempts ?? 0) >= MAX_OTP_ATTEMPTS) return invalid();

    const codeHash = crypto.createHash('sha256').update(dto.code).digest('hex');
    if (codeHash !== user.passwordResetCode) {
      user.passwordResetAttempts = (user.passwordResetAttempts ?? 0) + 1;
      if (user.passwordResetAttempts >= MAX_OTP_ATTEMPTS) {
        // Invalidate OTP after too many failed attempts
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
      }
      await user.save();
      return invalid();
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetAttempts = 0;
    await user.save();

    // Revocar todas las sesiones activas — si la cuenta fue comprometida,
    // el atacante pierde acceso inmediatamente al cambiar la contraseña.
    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: { $exists: false } },
      { revokedAt: new Date() }
    );

    coreEvents.emit('user:password_reset', { userId: user._id.toString() });
  },

  /**
   * Verify the email verification OTP and mark the account as verified.
   */
  async verifyEmail(email: string, code: string): Promise<PublicUser> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationCode +emailVerificationExpires'
    );

    if (!user) {
      const err = new Error('Invalid request') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    if (user.isEmailVerified) return toPublicUser(user);

    if (!user.emailVerificationCode || !user.emailVerificationExpires) {
      const err = new Error('No verification code pending. Request a new one.') as Error & {
        status: number;
      };
      err.status = 400;
      throw err;
    }

    if (user.emailVerificationExpires < new Date()) {
      const err = new Error('Verification code expired. Request a new one.') as Error & {
        status: number;
      };
      err.status = 400;
      throw err;
    }

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    if (codeHash !== user.emailVerificationCode) {
      const err = new Error('Invalid verification code.') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    coreEvents.emit('user:email_verified', {
      userId: user._id.toString(),
      email: user.email,
    });

    return toPublicUser(user);
  },

  /**
   * Generate and send a new email verification code.
   * Always returns success to prevent email enumeration.
   */
  async sendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+emailVerificationCode +emailVerificationExpires +verificationSentCount +verificationWindowStart'
    );

    if (!user || user.isEmailVerified) return; // silent

    checkEmailSendRate(user, 'verificationSentCount', 'verificationWindowStart');

    const rawCode = String(crypto.randomInt(100000, 1000000));
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    user.emailVerificationCode = codeHash;
    user.emailVerificationExpires = expires;
    await user.save();

    await getEmailAdapter().sendEmailVerification(user.email, rawCode);
  },

  /**
   * Verify a JWT access token and return the payload.
   */
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  },
};
