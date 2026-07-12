import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getReviewCycles,
  createReviewCycle,
  createReviewTemplate,
  launchReviewCycle,
  submitReview,
  getOverallScore,
} from "../services/review.service";
import {
  getMyReviews,
} from "../services/review.service";

export async function handleGetCycles(req: AuthRequest, res: Response) {
  try {
    const cycles = await getReviewCycles(req.user!.userId);
    res.status(200).json({ success: true, data: cycles });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleCreateCycle(req: AuthRequest, res: Response) {
  try {
    const { name, startDate, endDate } = req.body;
    const cycle = await createReviewCycle(req.user!.userId, name, startDate, endDate);
    res.status(201).json({ success: true, data: cycle });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleCreateTemplate(req: AuthRequest, res: Response) {
  try {
    const { reviewCycleId, name, description, questions } = req.body;
    const result = await createReviewTemplate(reviewCycleId, name, description, questions);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleLaunchCycle(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { reviewTemplateId } = req.body;
    const result = await launchReviewCycle(id, reviewTemplateId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleSubmitReview(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { answers } = req.body;
    const result = await submitReview(req.user!.userId, id, answers);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetOverallScore(req: AuthRequest, res: Response) {
  try {
    const employeeId = req.params.employeeId as string;
    const cycleId = req.params.cycleId as string;
    const result = await getOverallScore(employeeId, cycleId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
export async function handleGetMyReviews(
  req: AuthRequest,
  res: Response
) {
  try {
    const cycleId = req.params.cycleId as string;

    const reviews = await getMyReviews(
      req.user!.userId,
      cycleId
    );

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}