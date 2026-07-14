import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  CalendarDays,
  Target,
  ClipboardCheck,
  Users2,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Loader from "@/components/common/Loader";
import { useAuthStore } from "@/features/auth/useAuthStore";
import {
  useDashboardSummary,
  type EmployeeDashboardSummary,
  type ManagerDashboardSummary,
} from "./dashboardApi";
import type { GoalStatus } from "@/types";

const CHART_COLORS = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  info: "var(--info)",
  muted: "var(--muted-foreground)",
  grid: "var(--border)",
};

const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  "Not Started": CHART_COLORS.muted,
  "In Progress": CHART_COLORS.info,
  Achieved: CHART_COLORS.success,
  Deferred: CHART_COLORS.warning,
};

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="reporting-line rounded-lg border border-border bg-card p-4 pl-[calc(1rem+2px)]">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-foreground">
        {value}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

function GoalsPie({ data }: { data: { status: GoalStatus; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No goals yet.
      </p>
    );
  }
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={GOAL_STATUS_COLORS[entry.status]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: GOAL_STATUS_COLORS[d.status] }}
            />
            <span className="text-muted-foreground">{d.status}</span>
            <span className="font-mono font-medium text-foreground">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeDashboard({
  data,
  name,
}: {
  data: EmployeeDashboardSummary;
  name?: string;
}) {
  const dailyTarget = data.attendance.weeklyTargetHours / 5;
  const totalLeaveDays = data.leaveBalances.reduce(
    (sum, b) => sum + b.remaining_days,
    0,
  );
  const goalsInProgress =
    data.goalsByStatus.find((g) => g.status === "In Progress")?.count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
          {typeof name === "string" && name.trim().length > 0
            ? `, ${name.trim().split(" ")[0]}`
            : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Here's where things stand this week.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Hours this week"
          value={`${data.attendance.weeklyHours.toFixed(1)}h`}
          sublabel={`of ${data.attendance.weeklyTargetHours}h target`}
        />
        <StatCard
          icon={CalendarDays}
          label="Leave remaining"
          value={`${totalLeaveDays}d`}
        />
        <StatCard
          icon={Target}
          label="Goals in progress"
          value={String(goalsInProgress)}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Reviews pending"
          value={String(data.pendingReviewsCount)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Hours worked, last 7 days">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.attendance.daily}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fontSize: 12, fill: CHART_COLORS.muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                labelFormatter={(v) => formatDay(v as string)}
                formatter={
                  ((value: number | undefined) => [
                    value !== undefined ? `${value.toFixed(1)}h` : "0h",
                    "Worked",
                  ]) as any
                }
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              />
              <ReferenceLine
                y={dailyTarget}
                stroke={CHART_COLORS.accent}
                strokeDasharray="4 4"
              />
              <Bar
                dataKey="hours"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Goals by status">
          <GoalsPie data={data.goalsByStatus} />
        </ChartCard>
      </div>
    </div>
  );
}

function ManagerDashboard({
  data,
  name,
}: {
  data: ManagerDashboardSummary;
  name?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
          {typeof name === "string" && name.trim().length > 0
            ? `, ${name.trim().split(" ")[0]}`
            : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          A look across your team.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users2}
          label="Team size"
          value={String(data.teamSize)}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pending approvals"
          value={String(data.pendingApprovalsCount)}
        />
        <StatCard
          icon={Target}
          label="Goals achieved"
          value={String(
            data.goalsByStatus.find((g) => g.status === "Achieved")?.count ?? 0,
          )}
        />
        <StatCard
          icon={TrendingUp}
          label="Active review cycles"
          value={String(data.reviewCycles.length)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Team attendance, last 14 days">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.attendanceTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.muted }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                labelFormatter={(v) => formatDay(v as string)}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              />
              <Line
                type="monotone"
                dataKey="present"
                stroke={CHART_COLORS.success}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="late"
                stroke={CHART_COLORS.warning}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke={CHART_COLORS.destructive}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.success }}
              />{" "}
              Present
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.warning }}
              />{" "}
              Late
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.destructive }}
              />{" "}
              Absent
            </span>
          </div>
        </ChartCard>

        <ChartCard title="Goals by status, across your team">
          <GoalsPie data={data.goalsByStatus} />
        </ChartCard>
      </div>

      {data.reviewCycles.length > 0 && (
        <ChartCard title="Review cycle completion">
          <div className="space-y-4">
            {data.reviewCycles.map((cycle) => (
              <div key={cycle.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-foreground">{cycle.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {cycle.completionPercent}%
                  </span>
                </div>
                <Progress value={cycle.completionPercent} className="h-1.5" />
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return <Loader label="Loading your dashboard…" />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Dashboard unavailable. Please try again later.
      </div>
    );
  }

  if (data.scope !== "employee" && data.scope !== "manager") {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Dashboard unavailable.
      </div>
    );
  }

  return data.scope === "employee" ? (
    <EmployeeDashboard data={data} name={user?.full_name} />
  ) : (
    <ManagerDashboard data={data} name={user?.full_name} />
  );
}
