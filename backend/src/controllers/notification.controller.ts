import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notification.service";

export async function handleGetNotifications(req: AuthRequest, res: Response) {
  try {
    const notifications = await getMyNotifications(req.user!.userId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleMarkAsRead(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const notification = await markAsRead(req.user!.userId, id);
    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleMarkAllAsRead(req: AuthRequest, res: Response) {
  try {
    const result = await markAllAsRead(req.user!.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}