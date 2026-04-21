import { Router, type IRouter } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '@/middleware/authenticate';
import { requireAdmin } from '@/middleware/requireAdmin';
import { NotificationsController } from './notifications.controller';

const router: IRouter = Router();

router.use(authenticate, requireAdmin);

const notifLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many notification requests, slow down.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send', notifLimiter, NotificationsController.sendToUser);
router.post('/broadcast', notifLimiter, NotificationsController.broadcast);

export default router;
