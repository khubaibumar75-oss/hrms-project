import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../../components/ui/dialog";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import Loader from "@/components/common/Loader";
import {
  leaveRequestSchema,
  type LeaveRequestFormValues,
} from "@/schemas/leave.schema";
import {
  useLeaveBalances,
  useLeaveTypes,
  useMyLeaveRequests,
  useCreateLeaveRequest,
} from "./leaveApi";
import type { LeaveRequest, LeaveRequestStatus } from "@/types";

function statusPillClass(status: LeaveRequestStatus) {
  switch (status) {
    case "Approved":
      return "status-pill status-pill-success";
    case "Rejected":
      return "status-pill status-pill-destructive";
    default:
      return "status-pill status-pill-warning";
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function LeaveRequestPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: balances, isLoading: isBalancesLoading } = useLeaveBalances();
  const { data: leaveTypes } = useLeaveTypes();
  const createMutation = useCreateLeaveRequest();
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type_id: "",
      start_date: "",
      end_date: "",
      reason: "",
      isScheduled: false,
      scheduled_at: "",
    },
  });

  const isScheduled = watch("isScheduled");

  useEffect(() => {
    if (!isScheduled) {
      setValue("scheduled_at", "");
    }
  }, [isScheduled, setValue]);

  const onSubmit = (values: LeaveRequestFormValues) => {
    console.log("FINAL FORM VALUES:", values);

    createMutation.mutate(values, {
      onSuccess: () => {
        reset();
        setIsDialogOpen(false);
      },
    });
  };

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "created_at",
    direction: "desc",
  });
  const limit = 10;

  const { data: history, isLoading: isHistoryLoading } = useMyLeaveRequests({
    page,
    limit,
    search,
    sortField: sort.field,
    sortDirection: sort.direction,
  });

  const columns: DataTableColumn<LeaveRequest>[] = [
    {
      key: "leave_type",
      header: "Type",
      render: (row) => (
        <span className="font-medium text-foreground">
          {row.leave_type?.name ?? "—"}
        </span>
      ),
    },
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
        <span className="font-mono text-sm">
          {daysBetween(row.start_date, row.end_date)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <span className={statusPillClass(row.status)}>{row.status}</span>
      ),
    },
    {
      key: "created_at",
      header: "Requested",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Leave
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Request time off and track approvals.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request leave</DialogTitle>
              <DialogDescription>
                Your manager reviews this first, then HR gives final sign-off.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="leave_type_id">Leave type</Label>
                <Controller
                  name="leave_type_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="leave_type_id">
                        <SelectValue placeholder="Select a leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.leave_type_id && (
                  <p className="text-xs text-destructive">
                    {errors.leave_type_id.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                  />
                  {errors.start_date && (
                    <p className="text-xs text-destructive">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_date">End date</Label>
                  <Input id="end_date" type="date" {...register("end_date")} />
                  {errors.end_date && (
                    <p className="text-xs text-destructive">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  rows={3}
                  placeholder="Briefly explain the reason for this request…"
                  {...register("reason")}
                />
                {errors.reason && (
                  <p className="text-xs text-destructive">
                    {errors.reason.message}
                  </p>
                )}
              </div>
              <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="isScheduled"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="schedule-request"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                      />
                    )}
                  />

                  <Label htmlFor="schedule-request">
                    Schedule this leave request
                  </Label>
                </div>

                {watch("isScheduled") && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Schedule Date & Time</Label>

                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      min={new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)}
                      {...register("scheduled_at")}
                    />

                    <p className="text-xs text-muted-foreground">
                      Your manager will receive this leave request at the
                      selected date and time.
                    </p>
                  </div>
                )}
              </div>

              {createMutation.isError && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as any)?.response?.data?.message ??
                    "Couldn't submit the request. Try again."}
                </p>
              )}

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balances */}
      {isBalancesLoading ? (
        <Loader variant="inline" label="Loading balances…" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {balances?.map((balance) => (
            <div
              key={balance.id}
              className="reporting-line rounded-lg border border-border bg-card px-4 py-3.5 pl-[calc(1rem+2px)]"
            >
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {balance.leave_type?.name ?? "Leave"}
              </p>
              <p className="mt-1.5 font-display text-2xl font-semibold text-foreground">
                {balance.remaining_days}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  days left
                </span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold tracking-tight text-foreground">
          Your requests
        </h2>
        <DataTable
          columns={columns}
          data={history?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={isHistoryLoading}
          emptyMessage="You haven't requested any leave yet."
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search requests…"
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          page={page}
          totalPages={history?.totalPages ?? 1}
          total={history?.total ?? 0}
          limit={limit}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
