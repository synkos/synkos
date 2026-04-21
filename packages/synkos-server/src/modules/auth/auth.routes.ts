import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { authenticate, optionalAuth } from '@/middleware/authenticate';

const router: IRouter = Router();

// Stricter rate limiting for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many refresh attempts' },
  },
});

// ── Public routes (no auth required) ─────────────────────────────────────────

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.loginEmail);
router.post('/google', authLimiter, AuthController.loginGoogle);
router.post('/apple', authLimiter, AuthController.loginApple);
router.post('/refresh', refreshLimiter, AuthController.refresh);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/validate-reset-code', authLimiter, AuthController.validateResetCode);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.post('/verify-email', authLimiter, AuthController.verifyEmail);
router.post('/send-verification', authLimiter, AuthController.sendVerification);

// ── Protected routes (require valid access token) ─────────────────────────────

router.post('/logout', optionalAuth, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
