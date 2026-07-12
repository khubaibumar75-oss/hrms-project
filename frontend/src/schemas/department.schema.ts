import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Name is too short").max(255),
  manager_id: z.string().optional(),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const teamSchema = z.object({
  name: z.string().min(2, "Name is too short").max(255),
  department_id: z.string().min(1, "Select a department"),
  lead_id: z.string().optional(),
});
export type TeamFormValues = z.infer<typeof teamSchema>;