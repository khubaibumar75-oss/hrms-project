import { z } from "zod";

export const employeeStatusSchema = z.object({
  status: z.enum(["Active", "Terminated", "On Leave", "Pending"]),
  reason: z.string().max(500).optional(),
});
export type EmployeeStatusFormValues = z.infer<typeof employeeStatusSchema>;

export const createEmployeeSchema = z.object({
  full_name: z.string().min(2, "Name is too short").max(255),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  role_id: z.string().min(1, "Select a role"),
  designation: z.string().min(2, "Designation is required").max(255),
  employment_type: z.enum(["Full-time", "Part-time", "Intern", "Contractor"]),
  department_id: z.string().optional(),
  team_id: z.string().optional(),
  manager_id: z.string().optional(),
  joining_date: z.string().min(1, "Joining date is required"),
  salary: z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
      return undefined;
    }
    return Number(value);
  }, z.number().positive("Must be a positive number").optional()),
});
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
