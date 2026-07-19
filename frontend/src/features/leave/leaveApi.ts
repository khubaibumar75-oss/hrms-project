import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { safeGet } from "@/lib/safeApi";
import { axiosInstance } from "@/lib/axios";
import type {
  ApiResponse,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  PaginatedResponse,
} from "@/types";
import type { LeaveRequestFormValues } from "@/schemas/leave.schema";
export function useApproveHRLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await axiosInstance.patch(`/leave/${id}/hr-review`, {
        decision: "Approved",
        comment,
      });

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hr-leave-approvals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-leave-requests"],
      });
    },
  });
}
export function useRejectHRLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await axiosInstance.patch(`/leave/${id}/hr-review`, {
        decision: "Rejected",
        comment,
      });

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hr-leave-approvals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-leave-requests"],
      });
    },
  });
}

export function useLeaveBalances() {
  return useQuery({
    queryKey: ["leave-balances"],
    queryFn: () => safeGet<LeaveBalance[]>("/leave/balances", []),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ["leave-types"],
    queryFn: () => safeGet<LeaveType[]>("/leave/types", []),
  });
}

type SortDirection = "asc" | "desc";

type MyLeaveRequestsArgs = {
  page: number;
  limit: number;
  search: string;
  sortField: string;
  sortDirection: SortDirection;
};

async function myLeaveRequestsRequest(args: MyLeaveRequestsArgs) {
  const { data } = await axiosInstance.get<
    ApiResponse<PaginatedResponse<LeaveRequest>>
  >("/leave/requests", {
    params: {
      page: args.page,
      limit: args.limit,
      search: args.search,
      sortField: args.sortField,
      sortDirection: args.sortDirection,
    },
  });

  return data;
}

export function useMyLeaveRequests(args: MyLeaveRequestsArgs) {
  return useQuery({
    queryKey: ["my-leave-requests", args],
    queryFn: () => myLeaveRequestsRequest(args),
    select: (resp) => resp.data,
  });
}
async function createLeaveRequestRequest(payload: LeaveRequestFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<LeaveRequest>>(
    "/leave/requests",
    {
      leaveTypeId: payload.leave_type_id,
      startDate: payload.start_date,
      endDate: payload.end_date,
      reason: payload.reason,

      isScheduled: payload.isScheduled ?? false,
      scheduledAt: payload.scheduled_at
        ? new Date(payload.scheduled_at).toISOString()
        : null,
    },
  );

  return data;
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeaveRequestRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-leave-requests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["leave-balances"],
      });

      queryClient.invalidateQueries({
        queryKey: ["leave-approvals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["hr-leave-approvals"],
      });
    },
  });
}

type ApprovalArgs = {
  page: number;
  limit: number;
  search: string;
};

type LeaveApprovalResponse = {
  success: boolean;
  data: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
};
type LeaveApprovalResult = {
  items: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
async function getLeaveApprovalsRequest(
  args: ApprovalArgs,
): Promise<LeaveApprovalResult> {
  const { data } = await axiosInstance.get<LeaveApprovalResponse>(
    "/leave/approvals",
    {
      params: args,
    },
  );

  return {
    items: data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: Math.ceil(data.total / data.limit),
  };
}

export function useLeaveApprovals(args: ApprovalArgs) {
  return useQuery({
    queryKey: ["leave-approvals", args],
    queryFn: () => getLeaveApprovalsRequest(args),

    staleTime: 0,

    refetchOnWindowFocus: true,
    refetchOnMount: true,

    refetchInterval: 30000, // every 30 seconds
  });
}

async function getHRLeaveApprovalsRequest(
  args: ApprovalArgs,
): Promise<LeaveApprovalResult> {
  const { data } = await axiosInstance.get<LeaveApprovalResponse>(
    "/leave/hr-approvals",
    {
      params: args,
    },
  );

  return {
    items: data.data,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: Math.ceil(data.total / data.limit),
  };
}

export function useHRLeaveApprovals(args: ApprovalArgs) {
  return useQuery({
    queryKey: ["hr-leave-approvals", args],
    queryFn: () => getHRLeaveApprovalsRequest(args),
  });
}
export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await axiosInstance.patch(
        `/leave/${id}/manager-review`,
        {
          decision: "Approved",
          comment,
        },
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leave-approvals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-leave-requests"],
      });

      queryClient.invalidateQueries({
        queryKey: ["hr-leave-approvals"],
      });
    },
  });
}
export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data } = await axiosInstance.patch(
        `/leave/${id}/manager-review`,
        {
          decision: "Rejected",
          comment,
        },
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leave-approvals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-leave-requests"],
      });
    },
  });
}
