import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import { leaveDecisionSchema, type LeaveDecisionFormValues } from "@/schemas/leave.schema";
import { useLeaveApprovals, useApproveLeaveRequest, useRejectLeaveRequest } from "./leaveApi";
import type { LeaveRequest } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

type DecisionAction = "approve" | "reject";

export default function LeaveApprovalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data, isLoading } = useLeaveApprovals({ page, limit, search });
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const [activeRequest, setActiveRequest] = useState<LeaveRequest | null>(null);
  const [activeAction, setActiveAction] = useState<DecisionAction | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveDecisionFormValues>({ resolver: zodResolver(leaveDecisionSchema) });

  const openDecision = (row: LeaveRequest, action: DecisionAction) => {
    setActiveRequest(row);
    setActiveAction(action);
    reset({ comment: "" });
  };

  const closeDecision = () => {
    setActiveRequest(null);
    setActiveAction(null);
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const onSubmitDecision = (values: LeaveDecisionFormValues) => {
    if (!activeRequest || !activeAction) return;
    const mutate = activeAction === "approve" ? approveMutation.mutate : rejectMutation.mutate;
    mutate({ id: activeRequest.id, comment: values.comment }, { onSuccess: () => closeDecision() });
  };

  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.employee?.user?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.employee?.employee_code}</p>
        </div>
      ),
    },
    { key: "leave_type", header: "Type", render: (row) => row.leave_type?.name ?? "—" },
    {
      key: "dates",
      header: "Dates",
      render: (row) => (
        <span className="font-mono text-sm">
          {formatDate(row.start_date)} – {formatDate(row.end_date)}
        </span>
      ),
    },
    {
      key: "days",
      header: "Days",
      render: (row) => (
        <span className="font-mono text-sm">{daysBetween(row.start_date, row.end_date)}</span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (row) => (
        <span className="line-clamp-1 max-w-[220px] text-sm text-muted-foreground">{row.reason}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => openDecision(row, "reject")}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reject
          </Button>
          <Button size="sm" onClick={() => openDecision(row, "approve")}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Leave approvals
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Requests waiting on your review — manager sign-off happens before HR's final pass.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="Nothing waiting on your review right now."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by employee…"
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        limit={limit}
        onPageChange={setPage}
      />

      <Dialog open={!!activeRequest} onOpenChange={(open) => !open && closeDecision()}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmitDecision)} noValidate>
            <DialogHeader>
              <DialogTitle>{activeAction === "reject" ? "Reject" : "Approve"} leave request</DialogTitle>
              <DialogDescription>
                {activeRequest?.employee?.user?.full_name} —{" "}
                {activeRequest && formatDate(activeRequest.start_date)} to{" "}
                {activeRequest && formatDate(activeRequest.end_date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5 py-2">
              <Label htmlFor="comment">
                Comment {activeAction === "reject" ? "(let them know why)" : "(optional)"}
              </Label>
              <Textarea
                id="comment"
                rows={3}
                placeholder={
                  activeAction === "reject"
                    ? "e.g. Team is short-staffed that week, can we look at other dates?"
                    : "Add any context for the record…"
                }
                {...register("comment")}
              />
              {errors.comment && <p className="text-xs text-destructive">{errors.comment.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDecision} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                variant={activeAction === "reject" ? "destructive" : "default"}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm {activeAction === "reject" ? "rejection" : "approval"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}