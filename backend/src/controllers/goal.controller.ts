import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getGoals,
  createGoal,
  updateProgress,
  verifyGoal,
} from "../services/goal.service";

export async function handleGetGoals(req: AuthRequest, res: Response) {
  try {
    const goals = await getGoals();
    res.status(200).json({ success: true, data: goals });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleCreateGoal(req: AuthRequest, res: Response) {
  try {
    const { employeeId, title, description, targetDate } = req.body;
    const goal = await createGoal(req.user!.userId, employeeId, title, description, targetDate);
    res.status(201).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleUpdateProgress(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { progress, comment } = req.body;
    const goal = await updateProgress(req.user!.userId, id, progress, comment);
    res.status(200).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleVerifyGoal(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const goal = await verifyGoal(req.user!.userId, id);
    res.status(200).json({ success: true, data: goal });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}