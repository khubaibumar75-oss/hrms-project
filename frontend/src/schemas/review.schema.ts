import { z } from "zod";

export const reviewAnswerSchema = z.object({
  question_id: z.string().uuid(),
  rating: z
    .number()
    .int()
    .min(1, "Every question needs a rating before you can submit")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().trim().max(1000).optional(),
});

export const reviewSubmissionSchema = z.object({
  answers: z
    .array(reviewAnswerSchema)
    .min(1, "This review has no questions to answer"),
});

// Looser variant for "Save Draft" — allows unrated (0) questions so partial progress persists
export const reviewDraftSchema = z.object({
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      rating: z.number().int().min(0).max(5),
      comment: z.string().trim().max(1000).optional(),
    }),
  ),
});

export type ReviewSubmissionFormValues = z.infer<typeof reviewSubmissionSchema>;
export type ReviewDraftFormValues = z.infer<typeof reviewDraftSchema>;
