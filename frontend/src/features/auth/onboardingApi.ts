import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { ApiResponse, User } from "@/types";

interface VerifyTokenResult {
  valid: boolean;
  email?: string;
  full_name?: string;
}

interface ActivateResult {
  user: User;
  accessToken: string;
}

async function verifyToken(token: string) {
  const { data } = await axiosInstance.get<ApiResponse<VerifyTokenResult>>("/auth/verify-token", {
    params: { token },
  });
  return data.data;
}

async function activateAccount(payload: { token: string; password: string }) {
  const { data } = await axiosInstance.post<ApiResponse<ActivateResult>>("/auth/activate", payload);
  return data.data;
}

async function resendActivation(payload: { email: string }) {
  await axiosInstance.post("/auth/resend-activation", payload);
}

export function useVerifyActivationToken(token: string | null) {
  return useQuery({
    queryKey: ["auth", "verify-token", token],
    queryFn: () => verifyToken(token as string),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}

export function useActivateAccount() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: activateAccount,
    onSuccess: (data) => login(data.user, data.accessToken),
  });
}

export function useResendActivation() {
  return useMutation({ mutationFn: resendActivation });
}