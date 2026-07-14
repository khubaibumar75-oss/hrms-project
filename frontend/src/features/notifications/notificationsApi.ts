import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, AppNotification } from "@/types";

const KEYS = {
  recent: ["notifications", "recent"] as const,
};

async function fetchRecent() {
  const { data } = await axiosInstance.get<ApiResponse<AppNotification[]>>(
    "/notifications",
    {
      params: { limit: 10 },
    },
  );
  return data.data;
}

async function markAsRead(id: string) {
  const { data } = await axiosInstance.patch<ApiResponse<AppNotification>>(
    `/notifications/${id}/read`,
  );

  return data.data;
}
async function markAllAsRead() {
  await axiosInstance.patch("/notifications/read-all");
}

export function useRecentNotifications() {
  return useQuery({
    queryKey: KEYS.recent,
    queryFn: fetchRecent,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.recent }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.recent }),
  });
}
