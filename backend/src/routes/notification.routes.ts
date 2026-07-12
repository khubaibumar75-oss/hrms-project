import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  handleGetNotifications,
  handleMarkAsRead,
  handleMarkAllAsRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, handleGetNotifications);
router.patch("/read-all", authenticate, handleMarkAllAsRead);
router.patch("/:id/read", authenticate, handleMarkAsRead);

export default router;
