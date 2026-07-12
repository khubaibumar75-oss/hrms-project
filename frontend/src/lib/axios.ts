import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/features/auth/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    console.log("REQUEST:", config.url);
    console.log("TOKEN:", token);

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;

let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (err: unknown) => void,
) => {
  refreshSubscribers.push({ resolve, reject });
};

const notifySubscribers = (token: string) => {
  refreshSubscribers.forEach((s) => s.resolve(token));
  refreshSubscribers = [];
};

const rejectSubscribers = (err: unknown) => {
  refreshSubscribers.forEach((s) => s.reject(err));
  refreshSubscribers = [];
};

const logout = () => {
  const auth = useAuthStore.getState();

  auth.logout();

  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch {}
};

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((originalRequest.url ?? "").includes("/auth/refresh")) {
      logout();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      logout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        }, reject);
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await axiosInstance.post(
        "/auth/refresh",
        {},
        {
          withCredentials: true,
        },
      );

      const accessToken = refreshResponse.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("Refresh endpoint did not return an access token.");
      }

      useAuthStore.getState().setAccessToken(accessToken);

      notifySubscribers(accessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return axiosInstance(originalRequest);
    } catch (err) {
      rejectSubscribers(err);
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
