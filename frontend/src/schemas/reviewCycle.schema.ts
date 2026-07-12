import { z } from "zod";

export const reviewQuestionSchema = z.object({
  question_text: z.string().min(5, "Question is too short").max(500),
  weight: z.coerce.number().positive("Weight must be greater than 0"),
});
export type ReviewQuestionFormValues = z.infer<typeof reviewQuestionSchema>;

export const reviewTemplateSchema = z.object({
  name: z.string().min(3, "Name is too short").max(255),
  questions: z.array(reviewQuestionSchema).min(1, "Add at least one question"),
});
export type ReviewTemplateFormValues = z.infer<typeof reviewTemplateSchema>;

export const reviewCycleSchema = z
  .object({
    name: z.string().min(3, "Name is too short").max(255),
    template_id: z.string().min(1, "Select a template"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after the start date",
    path: ["end_date"],
  });
export type ReviewCycleFormValues = z.infer<typeof reviewCycleSchema>;