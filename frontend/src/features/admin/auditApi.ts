import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse, AuditLog } from "@/types";

export interface AuditLogWithActor extends AuditLog {
  actor?: { full_name: string; email: string };
}

export interface AuditLogParams {
  page: number;
  limit: number;
  search?: string;
  entity?: string;
}

async function fetchAuditLogs(params: AuditLogParams) {
  const { data } = await axiosInstance.get<PaginatedResponse<AuditLogWithActor>>("/audit-logs", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      entity: params.entity || undefined,
    },
  });
  return data.data;
}

export function useAuditLogs(params: AuditLogParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
    placeholderData: (prev) => prev,
  });
}