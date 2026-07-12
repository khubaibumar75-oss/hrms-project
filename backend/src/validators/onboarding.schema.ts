import { z } from "zod";

export const initiateOnboardingSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  roleId: z.string().uuid(),
  employeeCode: z.string().min(1),
  designation: z.string().min(1),
  employmentType: z.enum(["Full-time", "Part-time", "Intern", "Contractor"]),
  joiningDate: z.string().date(),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
});

export const verifySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});