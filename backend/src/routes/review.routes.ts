import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createCycleSchema,
  createTemplateSchema,
  launchCycleSchema,
  submitReviewSchema,
} from "../validators/review.schema";
import {
  handleGetCycles,
  handleCreateCycle,
  handleCreateTemplate,
  handleLaunchCycle,
  handleSubmitReview,
  handleGetOverallScore,
  handleGetMyReviews
} from "../controllers/review.controller";

const router = Router();

router.get("/cycles", authenticate, handleGetCycles);
router.post("/cycles", authenticate, validate(createCycleSchema), handleCreateCycle);
router.post("/templates", authenticate, validate(createTemplateSchema), handleCreateTemplate);
router.patch("/cycles/:id/launch", authenticate, validate(launchCycleSchema), handleLaunchCycle);
router.post("/:id/submit", authenticate, validate(submitReviewSchema), handleSubmitReview);
router.get("/score/:employeeId/:cycleId", authenticate, handleGetOverallScore);
router.get(
  "/cycles/:cycleId/my-reviews",
  authenticate,
  handleGetMyReviews
);
export default router;