import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import { initiateOnboardingSchema, verifySchema } from "../validators/onboarding.schema";
import { handleInitiateOnboarding, handleVerify } from "../controllers/onboarding.controller";

const router = Router();

// HR-only: create a new employee and trigger onboarding email
router.post(
  "/initiate",
  authenticate,
  requirePermission("employee:manage"),
  validate(initiateOnboardingSchema),
  handleInitiateOnboarding
);

// Public: candidate verifies their email and sets their password — no login required
router.post("/verify", validate(verifySchema), handleVerify);

export default router;