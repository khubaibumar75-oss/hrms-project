import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, GoalStatus } from "@/types";

export interface EmployeeDashboardSummary {
  scope: "employee";
  attendance: {
    weeklyHours: number;
    weeklyTargetHours: number;
    daily: { date: string; hours: number }[];
  };
  leaveBalances: { leave_type: string; remaining_days: number }[];
  goalsByStatus: { status: GoalStatus; count: number }[];
  pendingReviewsCount: number;
}

export interface ManagerDashboardSummary {
  scope: "manager";
  teamSize: number;
  pendingApprovalsCount: number;
  attendanceTrend: {
    date: string;
    present: number;
    late: number;
    absent: number;
  }[];
  goalsByStatus: { status: GoalStatus; count: number }[];
  reviewCycles: { id: string; name: string; completionPercent: number }[];
}

export type DashboardSummary =
  | EmployeeDashboardSummary
  | ManagerDashboardSummary;

async function fetchSummary() {
  const { data } =
    await axiosInstance.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary",
    );
  return data.data;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
    staleTime: 1000 * 60 * 2,
  });
}
