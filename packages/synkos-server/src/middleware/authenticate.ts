import type { Request, Response, NextFunction } from 'express';
import { User } from '@/modules/auth/user.model';
import { AuthService } from '@/modules/auth/auth.service';
import { getCache, CacheKeys } from '@/adapters/cache/cache.registry';
import { setRequestUserId } from '@/context/request-context';

/**
 * Extracts and verifies the Bearer access token.
 * Populates req.user with the full user document.
 * Rejects with 401 if token is missing, invalid, or expired.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing authorization header' },
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = AuthService.verifyAccessToken(token);
    const user = await getCache().getOrSet(
      CacheKeys.user(payload.sub),
      () => User.findById(payload.sub),
      300 // 5 min — invalidated on any profile write
    );

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found or disabled' },
      });
      return;
    }

    setRequestUserId(user._id.toString());
    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}

/**
 * Same as `authenticate` but does NOT reject if no token is present.
 * Useful for endpoints that behave differently for authenticated vs guest users.
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = AuthService.verifyAccessToken(token);
    const user = await getCache().getOrSet(
      CacheKeys.user(payload.sub),
      () => User.findById(payload.sub),
      300
    );
    if (user?.isActive) req.user = user;
  } catch {
    // Invalid token — continue as guest
  }

  next();
}
