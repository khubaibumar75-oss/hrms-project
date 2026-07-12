import { useEffect, useMemo, useState } from "react";
import { LogIn, LogOut, Coffee, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loader from "@/components/common/Loader";
import {
  useTodayAttendance,
  useAttendanceHistory,
  useClockIn,
  useClockOut,
  useStartBreak,
  useEndBreak,
} from "./attendanceApi";
import { useAuthStore } from "@/features/auth/useAuthStore";
import type { Attendance, AttendanceStatus } from "@/types";
import { cn } from "@/lib/utils";

function formatHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function statusPillClass(status: AttendanceStatus) {
  switch (status) {
    case "Present":
      return "status-pill status-pill-success";
    case "Late":
      return "status-pill status-pill-warning";
    case "Absent":
      return "status-pill status-pill-destructive";
    case "Half-Day":
      return "status-pill status-pill-info";
    default:
      return "status-pill status-pill-muted";
  }
}

const BLOCKED_ROLES = ["HR", "Admin"];
export default function ClockInOutPage() {
  const { user } = useAuthStore();

  const roleName =
    typeof user?.role === "string" ? user.role : user?.role?.name;

  const canAccessAttendance = !!roleName && !BLOCKED_ROLES.includes(roleName);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "attendance_date",
    direction: "desc",
  });
  const limit = 10;

  const { data: today, isLoading: isTodayLoading } = useTodayAttendance({
    enabled: canAccessAttendance,
  });
  const { data: history, isLoading: isHistoryLoading } = useAttendanceHistory({
    page,
    limit,
    search,
    sortField: sort.field,
    sortDirection: sort.direction,
    enabled: canAccessAttendance,
  });

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const startBreakMutation = useStartBreak();
  const endBreakMutation = useEndBreak();

  const [confirmClockOutOpen, setConfirmClockOutOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const isClockedIn = !!today?.clock_in && !today?.clock_out;
  const openBreak = today?.breaks?.find((b) => !b.end_time);
  const isOnBreak = isClockedIn && !!openBreak;

  useEffect(() => {
    if (!canAccessAttendance || !isClockedIn) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [canAccessAttendance, isClockedIn]);

  const workedMs = useMemo(() => {
    if (!today?.clock_in) return 0;
    const clockInMs = new Date(today.clock_in).getTime();
    const endMs = today.clock_out
      ? new Date(today.clock_out).getTime()
      : now.getTime();
    const grossMs = endMs - clockInMs;

    const breaksMs = (today.breaks ?? []).reduce((sum, b) => {
      const start = new Date(b.start_time).getTime();
      const end = b.end_time ? new Date(b.end_time).getTime() : now.getTime();
      return sum + Math.max(0, end - start);
    }, 0);

    return Math.max(0, grossMs - breaksMs);
  }, [today, now]);

  const breakMs = useMemo(() => {
    if (!openBreak) return 0;
    return now.getTime() - new Date(openBreak.start_time).getTime();
  }, [openBreak, now]);

  const columns: DataTableColumn<Attendance>[] = [
    {
      key: "attendance_date",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-foreground">
          {formatDate(row.attendance_date)}
        </span>
      ),
    },
    {
      key: "clock_in",
      header: "Clock in",
      render: (row) => (
        <span className="font-mono text-sm">{formatTime(row.clock_in)}</span>
      ),
    },
    {
      key: "clock_out",
      header: "Clock out",
      render: (row) => (
        <span className="font-mono text-sm">{formatTime(row.clock_out)}</span>
      ),
    },
    {
      key: "total_hours",
      header: "Total hours",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-sm">
          {row.total_hours != null ? `${row.total_hours.toFixed(2)}h` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={statusPillClass(row.status)}>{row.status}</span>
      ),
    },
  ];

  // HR / Admin: no attendance access at all
  if (!canAccessAttendance) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Attendance
          </h1>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm text-muted-foreground">
            Attendance is only available for employees and department managers.
          </p>
        </div>
      </div>
    );
  }

  if (isTodayLoading) {
    return <Loader label="Loading today's attendance…" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Attendance
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Clock in, take breaks, and review your hours.
        </p>
      </div>

      {/* Today's status card */}
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {isOnBreak
                ? "On break"
                : isClockedIn
                  ? "Worked today, so far"
                  : today?.clock_out
                    ? "Worked today"
                    : "Not clocked in"}
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold tabular-nums text-foreground sm:text-5xl">
              {formatHMS(workedMs)}
            </p>
            {isOnBreak && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-warning">
                <Coffee className="h-3.5 w-3.5" />
                On break for {formatHMS(breakMs)}
              </p>
            )}
            {today && (
              <p className="mt-2 text-xs text-muted-foreground">
                Clocked in at{" "}
                <span className="font-mono">{formatTime(today.clock_in)}</span>
                {today.clock_out && (
                  <>
                    {" "}
                    &middot; out at{" "}
                    <span className="font-mono">
                      {formatTime(today.clock_out)}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            {!today?.clock_in ? (
              <Button
                size="lg"
                onClick={() => clockInMutation.mutate()}
                disabled={clockInMutation.isPending}
              >
                {clockInMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                Clock in
              </Button>
            ) : today.clock_out ? (
              <div className="status-pill status-pill-muted justify-center py-1.5">
                Day complete — record locked
              </div>
            ) : (
              <>
                {isOnBreak ? (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => endBreakMutation.mutate()}
                    disabled={endBreakMutation.isPending}
                  >
                    {endBreakMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    End break
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => startBreakMutation.mutate()}
                    disabled={startBreakMutation.isPending}
                  >
                    {startBreakMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Coffee className="mr-2 h-4 w-4" />
                    )}
                    Start break
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setConfirmClockOutOpen(true)}
                  disabled={isOnBreak}
                  title={
                    isOnBreak ? "End your break before clocking out" : undefined
                  }
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Clock out
                </Button>
              </>
            )}
          </div>
        </div>

        {!!today?.breaks?.length && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today's breaks
            </p>
            <ul className="space-y-1.5">
              {today.breaks.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Coffee className="h-3.5 w-3.5" />
                    {formatTime(b.start_time)} –{" "}
                    {b.end_time ? formatTime(b.end_time) : "in progress"}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      !b.end_time && "font-medium text-warning",
                    )}
                  >
                    {b.end_time
                      ? `${b.duration_minutes ?? 0} min`
                      : formatHMS(
                          now.getTime() - new Date(b.start_time).getTime(),
                        )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold tracking-tight text-foreground">
          History
        </h2>
        <DataTable
          columns={columns}
          data={history?.items ?? []}
          rowKey={(row) => row.id}
          isLoading={isHistoryLoading}
          emptyMessage="No attendance records yet."
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search by date or status…"
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

      <ConfirmDialog
        open={confirmClockOutOpen}
        onOpenChange={setConfirmClockOutOpen}
        title="Clock out for today?"
        description="This locks today's record — clock-in time, breaks, and total hours can no longer be changed."
        confirmLabel="Clock out"
        isLoading={clockOutMutation.isPending}
        onConfirm={() => {
          clockOutMutation.mutate(undefined, {
            onSuccess: () => setConfirmClockOutOpen(false),
          });
        }}
      />
    </div>
  );
}
