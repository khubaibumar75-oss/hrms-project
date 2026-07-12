import { z } from "zod";

export const createGoalSchema = z.object({
  employee_id: z.string().min(1, "Select an employee"),
  title: z.string().min(3, "Title is too short").max(200),
  description: z.string().max(1000).optional(),
  target_date: z.string().min(1, "Target date is required"),
});
export type CreateGoalFormValues = z.infer<typeof createGoalSchema>;

// SRS 2.4: every progress edit requires an explanatory comment, logged to audit.
export const goalProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  comment: z.string().min(5, "Add a short note on what changed (at least 5 characters)").max(500),
});
export type GoalProgressFormValues = z.infer<typeof goalProgressSchema>;