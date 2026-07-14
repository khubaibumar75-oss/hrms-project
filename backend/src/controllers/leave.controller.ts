import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  requestLeave,
  managerReview,
  hrReview,
  getLeaveTypes,
  getLeaveBalances,
  getLeaveRequests,
  getLeaveApprovals,
  getHRLeaveApprovals,
} from "../services/leave.service";

export async function handleGetLeaveApprovals(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const result = await getLeaveApprovals(
      req.user!.userId,
      page,
      limit,
      search,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetHRLeaveApprovals(
  req: AuthRequest,
  res: Response,
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const result = await getHRLeaveApprovals(page, limit, search);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetLeaveTypes(req: AuthRequest, res: Response) {
  try {
    const types = await getLeaveTypes();

    res.status(200).json({
      success: true,

      data: types,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,

      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetLeaveBalances(req: AuthRequest, res: Response) {
  try {
    const balances = await getLeaveBalances(req.user!.userId);

    res.status(200).json({
      success: true,

      data: balances,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,

      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetLeaveRequests(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;

    const limit = parseInt(req.query.limit as string) || 10;

    const search = (req.query.search as string) || "";

    const sortField = (req.query.sortField as string) || "created_at";

    const sortDirection = (req.query.sortDirection as "asc" | "desc") || "desc";

    const result = await getLeaveRequests(
      req.user!.userId,

      page,

      limit,

      search,

      sortField,

      sortDirection,
    );

    res.status(200).json({
      success: true,

      ...result,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,

      message: error.message || "Something went wrong",
    });
  }
}

export async function handleRequestLeave(req: AuthRequest, res: Response) {
  try {
    const {
      leaveTypeId,
      startDate,
      endDate,
      reason,
      isScheduled,
      scheduledAt,
    } = req.body;

    const request = await requestLeave(
      req.user!.userId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
      isScheduled,
      scheduledAt,
    );

    res.status(201).json({
      success: true,
      data: request,
      message: isScheduled
        ? "Leave request scheduled successfully."
        : "Leave request submitted successfully.",
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleManagerReview(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const { decision, comment } = req.body;

    if (!["Approved", "Rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,

        message: "Invalid decision. Use Approved or Rejected",
      });
    }

    const request = await managerReview(
      req.user!.userId,

      id,

      decision,

      comment || "",
    );

    res.status(200).json({
      success: true,

      message: "Leave request reviewed successfully",

      data: request,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,

      message: error.message || "Something went wrong",
    });
  }
}

export async function handleHrReview(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const { decision, comment } = req.body;

    if (!["Approved", "Rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,

        message: "Invalid decision. Use Approved or Rejected",
      });
    }

    const request = await hrReview(
      req.user!.userId,

      id,

      decision,

      comment || "",
    );

    res.status(200).json({
      success: true,

      message: "HR leave review completed",

      data: request,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,

      message: error.message || "Something went wrong",
    });
  }
}
