import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

import {
  requestLeaveSchema,
  reviewLeaveSchema,
} from "../validators/leave.schema";

import {
  handleGetLeaveTypes,
  handleGetLeaveBalances,
  handleGetLeaveRequests,
  handleRequestLeave,
  handleManagerReview,
  handleHrReview,
  handleGetLeaveApprovals,
  handleGetHRLeaveApprovals,
} from "../controllers/leave.controller";

const router = Router();

router.get("/test", (req, res) => {
  res.json({
    message: "leave route working",
  });
});

router.get("/types", authenticate, handleGetLeaveTypes);

router.get("/balances", authenticate, handleGetLeaveBalances);

router.get("/approvals", authenticate, handleGetLeaveApprovals);

router.get("/hr-approvals", authenticate, handleGetHRLeaveApprovals);

router.patch(
  "/:id/manager-review",
  authenticate,
  validate(reviewLeaveSchema),
  handleManagerReview,
);

router.patch(
  "/:id/hr-review",
  authenticate,
  validate(reviewLeaveSchema),
  handleHrReview,
);

router.post(
  "/requests",
  authenticate,
  validate(requestLeaveSchema),
  handleRequestLeave,
);

router.get("/requests", authenticate, handleGetLeaveRequests);

export default router;
