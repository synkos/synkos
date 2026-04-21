import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '@/middleware/authenticate';
import { UsernameController } from './username.controller';

const router: IRouter = Router();

// Moderate rate limiting for availability checks (real-time typing)
const checkLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Slow down.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for mutation endpoints
const mutateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Try again later.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET  /username/check?username=xxx  — public availability check
router.get('/check', checkLimiter, UsernameController.checkAvailability);

// POST /username                     — set username for first time (authenticated)
router.post('/', mutateLimiter, authenticate, UsernameController.setUsername);

// PUT  /username                     — change username (authenticated, cooldown enforced)
router.put('/', mutateLimiter, authenticate, UsernameController.changeUsername);

export default router;
