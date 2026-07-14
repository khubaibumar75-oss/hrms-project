import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import { Loader2, ShieldAlert, Compass } from "lucide-react";

import LoginPage from "@/features/auth/LoginPage";
import ActivateAccountPage from "@/features/auth/ActivateAccountPage";
import DashboardPage from "@/features/dashboard/DashboardPage";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const EmployeeListPage = lazy(
  () => import("@/features/employees/EmployeeListPage"),
);

const EmployeeDetailPage = lazy(
  () => import("@/features/employees/EmployeeDetailPage"),
);

const ClockInOutPage = lazy(
  () => import("@/features/attendance/ClockInOutPage"),
);

const LeaveRequestPage = lazy(
  () => import("@/features/leave/LeaveRequestPage"),
);

const LeaveApprovalPage = lazy(
  () => import("@/features/leave/LeaveApprovalPage"),
);

const HRLeaveApprovalPage = lazy(
  () => import("@/features/leave/HRLeaveApprovalPage"),
);

const GoalsBoardPage = lazy(() => import("@/features/goals/GoalsBoardPage"));

const ReviewFormPage = lazy(() => import("@/features/reviews/ReviewFormPage"));

const OrgStructurePage = lazy(
  () => import("@/features/employees/OrgStructurePage"),
);

const ReviewCycleAdminPage = lazy(
  () => import("@/features/reviews/ReviewCycleAdminPage"),
);

const RolesPermissionsPage = lazy(
  () => import("@/features/admin/RolesPermissionsPage"),
);

const AuditLogPage = lazy(() => import("@/features/admin/AuditLogPage"));

const EMPLOYEE_ROLES = [
  "Employee",
  "Department Manager",
  "HR Manager",
  "Super Admin",
] as const;

function RouteFallback() {
  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

function UnauthorizedPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="h-10 w-10" />

      <h1 className="text-xl font-semibold">
        You don't have access to this page
      </h1>

      <p className="text-sm text-muted-foreground">
        Contact your administrator.
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Compass className="h-10 w-10" />

      <h1 className="text-xl font-semibold">Page Not Found</h1>

      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/activate" element={<ActivateAccountPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route
                element={<ProtectedRoute allowedRoles={[...EMPLOYEE_ROLES]} />}
              >
                <Route path="/attendance" element={<ClockInOutPage />} />
                <Route path="/leave" element={<LeaveRequestPage />} />
              </Route>

              <Route path="/goals" element={<GoalsBoardPage />} />

              <Route path="/reviews" element={<ReviewFormPage />} />

              <Route
                element={
                  <ProtectedRoute allowedRoles={["Department Manager"]} />
                }
              >
                <Route path="/employees" element={<EmployeeListPage />} />

                <Route path="/employees/:id" element={<EmployeeDetailPage />} />

                <Route
                  path="/leave/approvals"
                  element={<LeaveApprovalPage />}
                />
              </Route>

              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["Super Admin", "HR Manager"]}
                  />
                }
              >
                <Route
                  path="/leave/hr-approvals"
                  element={<HRLeaveApprovalPage />}
                />

                <Route path="/org-structure" element={<OrgStructurePage />} />

                <Route
                  path="/review-cycles"
                  element={<ReviewCycleAdminPage />}
                />

                <Route path="/audit-log" element={<AuditLogPage />} />
              </Route>

              <Route
                element={<ProtectedRoute allowedRoles={["Super Admin"]} />}
              >
                <Route
                  path="/roles-permissions"
                  element={<RolesPermissionsPage />}
                />
              </Route>

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
