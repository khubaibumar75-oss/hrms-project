import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min — HRMS data doesn't change second-to-second
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false, // avoid noisy refetches in an internal tool
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        // permanent-until-user-action errors: don't burn retries on them
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});