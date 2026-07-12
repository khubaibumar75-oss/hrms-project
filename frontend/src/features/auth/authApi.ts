import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { ApiResponse, User } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface MeResponse {
  user: User;
}

async function loginRequest(payload: LoginPayload) {
  const { data } = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload,
  );

  return data.data;
}

async function meRequest() {
  const { data } = await axiosInstance.get<ApiResponse<MeResponse>>("/auth/me");

  return data.data;
}

async function logoutRequest() {
  await axiosInstance.post("/auth/logout");
}

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.user, data.accessToken);
      queryClient.clear();
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useBootstrapAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  return useQuery({
    queryKey: ["auth", "me"],

    queryFn: async () => {
      try {
        let accessToken = useAuthStore.getState().accessToken;

        console.log("Initial Store Token:", accessToken);

        // No access token after page refresh? Get a new one.
        if (!accessToken) {
          console.log("No access token. Refreshing...");

          const refreshResp = await axiosInstance.post(
            "/auth/refresh",
            {},
            {
              withCredentials: true,
            },
          );

          accessToken = refreshResp.data?.data?.accessToken;

          if (!accessToken) {
            throw new Error("Refresh endpoint did not return an access token.");
          }

          setAccessToken(accessToken);

          console.log("New Access Token:", accessToken);
          console.log(
            "Store Token After Set:",
            useAuthStore.getState().accessToken,
          );
        }

        const data = await meRequest();

        setUser(data.user);

        console.log("Authenticated User:", data.user);

        return data.user;
      } catch (error) {
        console.error("[Auth Bootstrap] Authentication failed:", error);

        setUser(null);
        setAccessToken(null);

        return null;
      } finally {
        setInitializing(false);
      }
    },

    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });
}
