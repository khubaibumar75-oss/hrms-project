import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  clockIn,
  startBreak,
  endBreak,
  clockOut,
  getAttendanceHistory,
  getTodayAttendance,
} from "../services/attendance.service";

export async function handleClockIn(req: AuthRequest, res: Response) {
  try {
    const record = await clockIn(req.user!.userId, req.user!.roleId);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleStartBreak(req: AuthRequest, res: Response) {
  try {
    const record = await startBreak(req.user!.userId, req.user!.roleId);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleEndBreak(req: AuthRequest, res: Response) {
  try {
    const record = await endBreak(req.user!.userId, req.user!.roleId);
    res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleClockOut(req: AuthRequest, res: Response) {
  try {
    const record = await clockOut(req.user!.userId, req.user!.roleId);
    res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetAttendanceHistory(
  req: AuthRequest,
  res: Response,
) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const result = await getAttendanceHistory(
      req.user!.userId,
      req.user!.roleId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetTodayAttendance(
  req: AuthRequest,
  res: Response,
) {
  try {
    const attendance = await getTodayAttendance(
      req.user!.userId,
      req.user!.roleId,
    );

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
