import { axiosInstance } from "./axios";

export async function safeGet<T>(url: string, fallback: T): Promise<T> {
  try {
    const { data } = await axiosInstance.get(url);
    return data?.data ?? fallback;
  } catch (err) {
    console.warn("API failed:", url);
    return fallback;
  }
}