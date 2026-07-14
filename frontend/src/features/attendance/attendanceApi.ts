import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse, Attendance } from "@/types";

export interface AttendanceHistoryParams {
  page: number;
  limit: number;
  search?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

const QUERY_KEYS = {
  today: ["attendance", "today"] as const,
  history: (params: AttendanceHistoryParams) =>
    ["attendance", "history", params] as const,
};

async function fetchToday() {
  const { data } =
    await axiosInstance.get<ApiResponse<Attendance | null>>(
      "/attendance/today",
    );
  return data.data;
}

async function fetchHistory(params: AttendanceHistoryParams) {
  const { data } = await axiosInstance.get<PaginatedResponse<Attendance>>(
    "/attendance",
    {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        sortField: params.sortField,
        sortDirection: params.sortDirection,
      },
    },
  );
  return data.data;
}

async function clockIn() {
  const { data } = await axiosInstance.post<ApiResponse<Attendance>>(
    "/attendance/clock-in",
  );
  return data.data;
}
async function clockOut() {
  const { data } = await axiosInstance.post<ApiResponse<Attendance>>(
    "/attendance/clock-out",
  );
  return data.data;
}
async function startBreak() {
  const { data } = await axiosInstance.post<ApiResponse<Attendance>>(
    "/attendance/breaks/start",
  );
  return data.data;
}
async function endBreak() {
  const { data } = await axiosInstance.post<ApiResponse<Attendance>>(
    "/attendance/breaks/end",
  );
  return data.data;
}

export function useTodayAttendance(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.today,
    queryFn: fetchToday,
    staleTime: 1000 * 30,
    enabled: options?.enabled ?? true,
  });
}

export function useAttendanceHistory(
  params: AttendanceHistoryParams & { enabled?: boolean },
) {
  const { enabled, ...queryParams } = params;
  return useQuery({
    queryKey: QUERY_KEYS.history(queryParams),
    queryFn: () => fetchHistory(queryParams),
    placeholderData: (prev) => prev,
    enabled: enabled ?? true,
  });
}
function useAttendanceAction(mutationFn: () => Promise<Attendance>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.today,
      });

      queryClient.invalidateQueries({
        queryKey: ["attendance", "history"],
      });
    },
  });
}
export function useClockIn() {
  return useAttendanceAction(clockIn);
}
export function useClockOut() {
  return useAttendanceAction(clockOut);
}
export function useStartBreak() {
  return useAttendanceAction(startBreak);
}
export function useEndBreak() {
  return useAttendanceAction(endBreak);
}
