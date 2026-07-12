import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, Briefcase, Users, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { useEmployeeDetail } from "./employeeApi";
import type { EmployeeStatus } from "@/types";

function statusPillClass(status: EmployeeStatus) {
  switch (status) {
    case "Active":
      return "status-pill status-pill-success";
    case "On Leave":
      return "status-pill status-pill-warning";
    case "Terminated":
      return "status-pill status-pill-destructive";
    default:
      return "status-pill status-pill-muted";
  }
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading } = useEmployeeDetail(id);
  const currentUser = useAuthStore((s) => s.user);

  // SRS §3.3: salary requires isolated column visibility — only render it if
  // the backend actually sends it AND the viewer is Super Admin/HR Manager.
  // If your API strips salary server-side for other roles already, this
  // client-side gate is just a belt-and-suspenders extra.
  const canViewSalary =
    currentUser?.role?.name === "Super Admin" || currentUser?.role?.name === "HR Manager";

  if (isLoading || !employee) return <Loader />;

  const fullName = employee.user?.full_name ?? "Unnamed Employee";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/employees">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold text-foreground">{fullName}</h1>
        <span className={statusPillClass(employee.status)}>{employee.status}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="reporting-line md:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Field icon={<Briefcase className="h-4 w-4" />} label="Designation" value={employee.designation} />
            <Field icon={<Users className="h-4 w-4" />} label="Department" value={employee.department?.name ?? "—"} />
            <Field label="Team" value={employee.team?.name ?? "—"} />
            <Field label="Employment Type" value={employee.employment_type} />
            <Field
              icon={<Calendar className="h-4 w-4" />}
              label="Joining Date"
              value={new Date(employee.joining_date).toLocaleDateString()}
              mono
            />
            <Field icon={<Mail className="h-4 w-4" />} label="Email" value={employee.user?.email ?? "—"} />
            <Field label="Employee Code" value={employee.employee_code} mono />
            <Field label="Role" value={employee.user?.role?.name ?? "—"} />
            {canViewSalary && employee.salary != null && (
              <Field
                icon={<DollarSign className="h-4 w-4" />}
                label="Salary"
                value={employee.salary.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                mono
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Reporting Line</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Reports to</p>
              <p className="font-medium">{employee.manager?.user?.full_name ?? "No manager assigned"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {employee.direct_reports && employee.direct_reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Direct Reports ({employee.direct_reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {employee.direct_reports.map((report) => (
              <Link
                key={report.id}
                to={`/employees/${report.id}`}
                className="reporting-line rounded-md border bg-card p-3 text-sm transition hover:bg-muted/50"
              >
                <p className="font-medium">{report.user?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{report.designation}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={mono ? "font-mono" : "font-medium"}>{value}</p>
    </div>
  );
}