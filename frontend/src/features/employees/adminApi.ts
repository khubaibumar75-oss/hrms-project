import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Department, Team, Role, Employee } from "@/types";
import type { DepartmentFormValues, TeamFormValues } from "@/schemas/department.schema";
import type { CreateEmployeeFormValues } from "@/schemas/employee.schema";

export interface EmployeeOption {
  id: string;
  employee_code: string;
  user: { full_name: string };
}

const KEYS = {
  departments: ["departments", "admin"] as const,
  teams: (departmentId?: string) => ["teams", departmentId ?? "all"] as const,
  roles: ["roles"] as const,
  employeeOptions: ["employees", "options"] as const,
};

// ── Departments ──────────────────────────────────────────────────────────
async function fetchDepartments() {
  const { data } = await axiosInstance.get<ApiResponse<Department[]>>("/departments");
  return data.data;
}
async function createDepartment(payload: DepartmentFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<Department>>("/departments", payload);
  return data.data;
}
async function updateDepartment({ id, ...payload }: DepartmentFormValues & { id: string }) {
  const { data } = await axiosInstance.patch<ApiResponse<Department>>(`/departments/${id}`, payload);
  return data.data;
}

// ── Teams ────────────────────────────────────────────────────────────────
async function fetchTeams(departmentId?: string) {
  const { data } = await axiosInstance.get<ApiResponse<Team[]>>("/teams", {
    params: { department_id: departmentId || undefined },
  });
  return data.data;
}
async function createTeam(payload: TeamFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<Team>>("/teams", payload);
  return data.data;
}
async function updateTeam({ id, ...payload }: TeamFormValues & { id: string }) {
  const { data } = await axiosInstance.patch<ApiResponse<Team>>(`/teams/${id}`, payload);
  return data.data;
}

// ── Roles (read-only here; assigning permissions to roles is its own page) ─
async function fetchRoles() {
  const { data } = await axiosInstance.get<ApiResponse<Role[]>>("/roles");
  return data.data;
}

// ── Lightweight employee picker (manager/lead selects) ─────────────────
async function fetchEmployeeOptions() {
  const { data } = await axiosInstance.get<ApiResponse<EmployeeOption[]>>("/employees/options");
  return data.data;
}

// ── Onboarding (SRS §2.1 step 1) ────────────────────────────────────────
async function createEmployeeOnboarding(payload: CreateEmployeeFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<Employee>>("/employees/onboard", payload);
  return data.data;
}

export function useDepartmentsAdmin() {
  return useQuery({ queryKey: KEYS.departments, queryFn: fetchDepartments });
}
export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.departments });
      queryClient.invalidateQueries({ queryKey: ["departments"] }); // also used by EmployeeListPage filter
    },
  });
}
export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.departments });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useTeamsAdmin(departmentId?: string) {
  return useQuery({ queryKey: KEYS.teams(departmentId), queryFn: () => fetchTeams(departmentId) });
}
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useRoles() {
  return useQuery({ queryKey: KEYS.roles, queryFn: fetchRoles, staleTime: 1000 * 60 * 30 });
}

export function useEmployeeOptions() {
  return useQuery({
    queryKey: KEYS.employeeOptions,
    queryFn: fetchEmployeeOptions,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateEmployeeOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployeeOnboarding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees", "list"] }),
  });
}