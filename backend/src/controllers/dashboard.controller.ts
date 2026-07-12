import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getDashboardSummary } from "../services/dashboard.service";

export async function dashboardSummary(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const data = await getDashboardSummary(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard",
    });
  }
}