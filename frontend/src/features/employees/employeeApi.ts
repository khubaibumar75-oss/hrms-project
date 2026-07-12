import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Employee, PaginatedResponse } from "@/types";

export interface EmployeeWithReports extends Employee {
  direct_reports?: Employee[];
}

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.all, "list", params] as const,
  detail: (id: string) => [...employeeKeys.all, "detail", id] as const,
};

export interface EmployeeListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: string;
}

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        ApiResponse<PaginatedResponse<Employee>>
      >("/employees", {
        params,
      });

      return data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useEmployeeDetail(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        ApiResponse<EmployeeWithReports>
      >(`/employees/${id}`);

      return data.data;
    },
    enabled: !!id,
  });
}
