import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  handleClockIn,
  handleStartBreak,
  handleEndBreak,
  handleClockOut,
  handleGetAttendanceHistory,
  handleGetTodayAttendance,
} from "../controllers/attendance.controller";

const router = Router();

router.get("/test", (req, res) => {
  res.json({
    message: "attendance route working",
  });
});

router.get("/", authenticate, handleGetAttendanceHistory);
router.get("/today", authenticate, handleGetTodayAttendance);

router.post("/clock-in", authenticate, handleClockIn);
router.post("/breaks/start", authenticate, handleStartBreak);
router.post("/breaks/end", authenticate, handleEndBreak);
router.post("/clock-out", authenticate, handleClockOut);

export default router;
