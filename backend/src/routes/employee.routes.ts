import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/rbac.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  handleGetEmployees,
  handleGetEmployeeOptions,
  handleGetMyTeam,
  handleGetEmployeeDetail,
} from "../controllers/employee.controller";
import { handleInitiateOnboarding } from "../controllers/onboarding.controller";
import { initiateOnboardingSchema } from "../validators/onboarding.schema";

const router = Router();

router.get("/", authenticate, handleGetEmployees);
router.get("/options", authenticate, handleGetEmployeeOptions);
router.get("/my-team", authenticate, handleGetMyTeam);
router.get("/:id", authenticate, handleGetEmployeeDetail);
router.post(
  "/onboard",
  authenticate,
  requirePermission("employee:manage"),
  validate(initiateOnboardingSchema),
  handleInitiateOnboarding
);

export default router;
