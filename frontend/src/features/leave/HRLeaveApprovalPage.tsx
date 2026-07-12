import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";

import {
  useHRLeaveApprovals,
  useApproveHRLeaveRequest,
  useRejectHRLeaveRequest,
} from "./leaveApi";

import type { LeaveRequest } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function HRLeaveApprovalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const limit = 10;

  const { data, isLoading } = useHRLeaveApprovals({
    page,
    limit,
    search,
  });

  const approveMutation = useApproveHRLeaveRequest();
  const rejectMutation = useRejectHRLeaveRequest();

  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div>
          <p className="font-medium">
            {row.employee?.user?.full_name ?? "Unknown"}
          </p>

          <p className="text-xs text-muted-foreground">
            {row.employee?.employee_code}
          </p>
        </div>
      ),
    },

    {
      key: "leave_type",
      header: "Leave Type",
      render: (row) => row.leave_type?.name ?? "-",
    },

    {
      key: "dates",
      header: "Dates",
      render: (row) => (
        <span>
          {formatDate(row.start_date)}
          {" - "}
          {formatDate(row.end_date)}
        </span>
      ),
    },

    {
      key: "days",
      header: "Days",
      render: (row) => daysBetween(row.start_date, row.end_date),
    },

    {
      key: "manager_status",
      header: "Manager Status",
      render: (row) => (
        <span className="text-green-600">{row.manager_status}</span>
      ),
    },

    {
      key: "reason",
      header: "Reason",
      render: (row) => (
        <span className="max-w-[220px] truncate block">{row.reason}</span>
      ),
    },

    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="destructive"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() =>
              rejectMutation.mutate({
                id: row.id,
                comment: "Rejected by HR",
              })
            }
          >
            {rejectMutation.isPending && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            <X className="mr-1 h-3 w-3" />
            Reject
          </Button>

          <Button
            size="sm"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() =>
              approveMutation.mutate({
                id: row.id,
                comment: "Approved by HR",
              })
            }
          >
            {approveMutation.isPending && (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            <Check className="mr-1 h-3 w-3" />
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">HR Leave Approval</h1>

        <p className="text-sm text-muted-foreground">
          Final approval after department manager review.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No leaves waiting for HR approval."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search employee..."
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        limit={limit}
        onPageChange={setPage}
      />
    </div>
  );
}
