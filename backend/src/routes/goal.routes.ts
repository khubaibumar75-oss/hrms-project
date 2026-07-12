import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createGoalSchema, updateProgressSchema } from "../validators/goal.schema";
import {
  handleGetGoals,
  handleCreateGoal,
  handleUpdateProgress,
  handleVerifyGoal,
} from "../controllers/goal.controller";

const router = Router();

router.get("/", authenticate, handleGetGoals);
router.post("/", authenticate, validate(createGoalSchema), handleCreateGoal);
router.patch("/:id/progress", authenticate, validate(updateProgressSchema), handleUpdateProgress);
router.patch("/:id/verify", authenticate, handleVerifyGoal);

export default router;