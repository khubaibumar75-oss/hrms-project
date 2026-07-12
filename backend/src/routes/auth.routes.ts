import { Router } from "express";
import {
  login,
  getMe,
  refresh,
  logout,
  verifyTokenController,
  activateAccountController,
  resendActivationController,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { loginSchema } from "../validators/auth.schema";

const router = Router();

// Public Routes
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/verify-token", verifyTokenController);
router.post("/activate", activateAccountController);
router.post("/resend-activation", resendActivationController);

// Protected Routes
router.get("/me", authenticate, getMe);

export default router;