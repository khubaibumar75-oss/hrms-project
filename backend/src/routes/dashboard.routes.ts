import { Router } from "express";
import { dashboardSummary } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/summary", authenticate, dashboardSummary);

export default router;