import { z } from "zod";

export const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(500).optional(),
});

export const leaveRequestSchema = z
  .object({
    leave_type_id: z.string().min(1, "Select a leave type"),

    start_date: z.string().min(1, "Start date is required"),

    end_date: z.string().min(1, "End date is required"),

    reason: z
      .string()
      .min(10, "Give a brief reason (at least 10 characters)")
      .max(500),

    isScheduled: z.boolean(),

    scheduled_at: z.string().optional(),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "End date can't be before the start date",
    path: ["end_date"],
  })
  .refine(
    (data) => {
      if (!data.isScheduled) return true;

      if (!data.scheduled_at) return false;

      return new Date(data.scheduled_at) < new Date(data.start_date);
    },
    {
      message: "Schedule date must be before the leave start date.",
      path: ["scheduled_at"],
    },
  );

export type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

export const leaveDecisionSchema = z.object({
  comment: z.string().max(500).optional(),
});

export type LeaveDecisionFormValues = z.infer<typeof leaveDecisionSchema>;
