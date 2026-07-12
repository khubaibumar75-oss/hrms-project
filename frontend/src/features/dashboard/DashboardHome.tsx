import {
  Users,
  UserCheck,
  UserX,
  ClipboardCheck,
  Target,
  Trophy,
  ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useDashboardSummary } from "./dashboardApi";



// Matches APPROVER_ROLES in AppRouter.tsx — keep these two lists in sync,
// or better, hoist APPROVER_ROLES into a shared constants file and import it
// in both places.
const MANAGER_PLUS_ROLES = ["Super Admin", "HR Manager", "Department Manager"];

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: boolean;
}

function KpiCard({ icon, label, value, accent }: KpiCardProps) {
  return (
    <Card className={accent ? "reporting-line" : ""}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-md bg-primary/10 p-2.5 text-primary">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-mono text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-6 w-12 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading, isError } = useDashboardSummary();

  const isManagerPlus = !!user?.role?.name && MANAGER_PLUS_ROLES.includes(user.role.name);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Signed in as {user?.role?.name ?? "—"}. Here's what's happening across the org today.
        </p>
      </div>

      {isError && (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Dashboard summary endpoint isn't available yet — KPI cards will populate once{" "}
          <code className="font-mono text-xs">GET /dashboard/summary</code> is wired up on the backend.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}

        {kpis && (
          <>
            {isManagerPlus && (
              <KpiCard icon={<Users className="h-5 w-5" />} label="Total Employees" value={kpis.total_employees} />
            )}
            <KpiCard icon={<UserCheck className="h-5 w-5" />} label="Active Today" value={kpis.active_today} />
            <KpiCard icon={<UserX className="h-5 w-5" />} label="On Leave Today" value={kpis.on_leave_today} />
            {isManagerPlus && (
              <KpiCard
                icon={<ClipboardCheck className="h-5 w-5" />}
                label="Pending Approvals"
                value={kpis.pending_leave_approvals}
                accent={kpis.pending_leave_approvals > 0}
              />
            )}
            <KpiCard icon={<Target className="h-5 w-5" />} label="Goals In Progress" value={kpis.goals_in_progress} />
            <KpiCard
              icon={<Trophy className="h-5 w-5" />}
              label="Goals Achieved (Qtr)"
              value={kpis.goals_achieved_this_quarter}
            />
            {kpis.active_review_cycle && (
              <KpiCard
                icon={<ClipboardList className="h-5 w-5" />}
                label={`Reviews Pending — ${kpis.active_review_cycle.name}`}
                value={kpis.active_review_cycle.pending_reviews_count}
                accent={kpis.active_review_cycle.pending_reviews_count > 0}
              />
            )}
          </>
        )}
      </div>

      {kpis && kpis.attendance_trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Attendance Trend (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={kpis.attendance_trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                {/* Replace these CSS var names with your actual status-pill vars from index.css */}
                <Line type="monotone" dataKey="present" stroke="var(--success, #16a34a)" strokeWidth={2} />
                <Line type="monotone" dataKey="late" stroke="var(--warning, #d97706)" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="var(--destructive, #dc2626)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}