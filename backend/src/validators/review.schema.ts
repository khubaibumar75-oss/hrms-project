import { z } from "zod";

export const createCycleSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().date(),
  endDate: z.string().date(),
});

export const createTemplateSchema = z.object({
  reviewCycleId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),
        weight: z.number().positive(),
      })
    )
    .min(1),
});

export const launchCycleSchema = z.object({
  reviewTemplateId: z.string().uuid(),
});

export const submitReviewSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        answerText: z.string().optional(),
      })
    )
    .min(1),
});