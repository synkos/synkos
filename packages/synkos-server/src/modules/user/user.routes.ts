import { Router, type IRouter } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { authenticate } from "@/middleware/authenticate";
import { UserController } from "./user.controller";

const router: IRouter = Router();

// All user profile endpoints require a valid access token
router.use(authenticate);

// ── Rate limiters ─────────────────────────────────────────────────────────────

/** General profile mutations — permissive, covers name & photo. */
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many profile update attempts, try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Stricter limit for username changes — mirrors the username module's mutate limiter. */
const usernameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many username change attempts, try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Password changes require strict rate limiting (brute-force surface). */
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    success: false,
    error: { code: "TOO_MANY_REQUESTS", message: "Too many password change attempts, try again later." },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Multer (avatar upload — memory storage, 5 MB cap) ─────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB — enforced again in StorageService
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are accepted."));
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────

router.patch("/name",       profileLimiter,  UserController.patchName);
router.patch("/username",   usernameLimiter, UserController.patchUsername);
router.patch("/photo",      profileLimiter,  upload.single("photo"), UserController.patchPhoto);
router.patch("/password",   passwordLimiter, UserController.patchPassword);
router.patch("/push-token",  profileLimiter, UserController.patchPushToken);
router.delete("/push-token", profileLimiter, UserController.deletePushToken);

export default router;
