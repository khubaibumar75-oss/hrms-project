import { z } from "zod";

export const createGoalSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  targetDate: z.string().date("Invalid target date"),
});

export const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
  comment: z.string().min(1, "Comment is required"),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;