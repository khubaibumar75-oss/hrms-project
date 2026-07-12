import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Goal } from "@/types";
import type { CreateGoalFormValues, GoalProgressFormValues } from "@/schemas/goal.schema";

export interface TeamMemberOption {
  id: string; // employee id
  employee_code: string;
  user: { full_name: string };
}

const KEYS = {
  list: ["goals"] as const,
  myTeam: ["goals", "my-team"] as const,
};

async function fetchGoals() {
  const { data } = await axiosInstance.get<ApiResponse<Goal[]>>("/goals");
  return data.data;
}

async function fetchMyTeam() {
  const { data } = await axiosInstance.get<ApiResponse<TeamMemberOption[]>>("/employees/my-team");
  return data.data;
}

async function createGoal(payload: CreateGoalFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<Goal>>("/goals", payload);
  return data.data;
}

async function updateProgress({ id, ...payload }: GoalProgressFormValues & { id: string }) {
  const { data } = await axiosInstance.patch<ApiResponse<Goal>>(`/goals/${id}/progress`, payload);
  return data.data;
}

async function validateGoal({ id, approved }: { id: string; approved: boolean }) {
  const { data } = await axiosInstance.post<ApiResponse<Goal>>(`/goals/${id}/validate`, { approved });
  return data.data;
}

export function useGoals() {
  return useQuery({ queryKey: KEYS.list, queryFn: fetchGoals });
}

/** Manager-only: populates the "assign to" dropdown when creating a goal. */
export function useMyTeam(enabled: boolean) {
  return useQuery({ queryKey: KEYS.myTeam, queryFn: fetchMyTeam, enabled, staleTime: 1000 * 60 * 5 });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProgress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.list }),
  });
}

export function useValidateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: validateGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.list }),
  });
}