import { z } from "zod";

export const requestLeaveSchema = z
  .object({
    leaveTypeId: z.string().uuid("Invalid leave type"),
    startDate: z.string().date("Invalid start date"),
    endDate: z.string().date("Invalid end date"),
    reason: z.string().min(1, "Reason is required"),
    isScheduled: z.boolean().optional().default(false),
    scheduledAt: z.string().nullable().optional(),
  })
  .refine((data) => !data.isScheduled || !!data.scheduledAt, {
    message: "Scheduled date is required when scheduling a leave request.",
    path: ["scheduledAt"],
  });

export const reviewLeaveSchema = z.object({
  decision: z.enum(["Approved", "Rejected"]),
  comment: z.string().optional().default(""),
});

export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
