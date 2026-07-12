import {
  Users,
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

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-md bg-primary/10 p-2.5 text-primary">
          {icon}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

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

  const { data: dashboard, isLoading, isError } = useDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Welcome back
          {user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
        </h1>

        <p className="text-sm text-muted-foreground">
          Signed in as {user?.role?.name ?? "-"}
        </p>
      </div>

      {isError && (
        <p className="rounded border p-4 text-sm">Dashboard API failed.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}

        {dashboard?.scope === "manager" && (
          <>
            <KpiCard
              icon={<Users />}
              label="Team Size"
              value={dashboard.teamSize}
            />

            <KpiCard
              icon={<ClipboardCheck />}
              label="Pending Approvals"
              value={dashboard.pendingApprovalsCount}
            />

            <KpiCard
              icon={<Target />}
              label="Goal Categories"
              value={dashboard.goalsByStatus.length}
            />

            <KpiCard
              icon={<ClipboardList />}
              label="Review Cycles"
              value={dashboard.reviewCycles.length}
            />
          </>
        )}

        {dashboard?.scope === "employee" && (
          <>
            <KpiCard
              icon={<Users />}
              label="Weekly Hours"
              value={dashboard.attendance.weeklyHours}
            />

            <KpiCard
              icon={<ClipboardCheck />}
              label="Pending Reviews"
              value={dashboard.pendingReviewsCount}
            />

            <KpiCard
              icon={<Target />}
              label="Goals"
              value={dashboard.goalsByStatus.length}
            />

            <KpiCard
              icon={<Trophy />}
              label="Leave Types"
              value={dashboard.leaveBalances.length}
            />
          </>
        )}
      </div>

      {dashboard?.scope === "manager" &&
        dashboard.attendanceTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dashboard.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line type="monotone" dataKey="present" stroke="#16a34a" />

                  <Line type="monotone" dataKey="late" stroke="#d97706" />

                  <Line type="monotone" dataKey="absent" stroke="#dc2626" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
