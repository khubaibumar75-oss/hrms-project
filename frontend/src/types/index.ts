// ── Shared enums (mirrors backend VARCHAR status columns) ──────────────────

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Intern"
  | "Contractor";
export type EmployeeStatus = "Active" | "Terminated" | "On Leave" | "Pending";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "Half-Day";
export type LeaveRequestStatus = "Pending" | "Approved" | "Rejected";
export type GoalStatus =
  | "Not Started"
  | "In Progress"
  | "Achieved"
  | "Deferred";
export type ReviewType = "Self" | "Peer" | "Manager";
export type ReviewCycleStatus = "Draft" | "Active" | "Closed" | "Published";
export type RoleName =
  | "Super Admin"
  | "HR Manager"
  | "Department Manager"
  | "Employee";

// ── Auth / RBAC ──────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  name: string; // e.g. 'leave:approve'
  module: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE";
}

export interface Role {
  id: string;
  name: RoleName;
  description?: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  email: string;

  fullName?: string;
  full_name?: string;

  role_id?: string;

  role: Role;

  is_verified?: boolean;
  is_active?: boolean;

  last_login?: string | null;

  created_at?: string;
  updated_at?: string;
}

// ── Org structure ────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  manager_id?: string | null;
  manager?: Employee;
}

export interface Team {
  id: string;
  department_id: string;
  name: string;
  lead_id?: string | null;
}

export interface Employee {
  id: string;
  user_id: string;
  user?: User;
  employee_code: string;
  department_id?: string | null;
  department?: Department;
  team_id?: string | null;
  team?: Team;
  manager_id?: string | null;
  manager?: Employee;
  designation: string;
  employment_type: EmploymentType;
  salary?: number;
  joining_date: string;
  status: EmployeeStatus;
}

// ── Attendance ───────────────────────────────────────────────────────────

export interface AttendanceBreak {
  id: string;
  attendance_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
}

export interface Attendance {
  id: string;
  employee_id: string;
  attendance_date: string;
  clock_in: string;
  clock_out: string | null;
  status: AttendanceStatus;
  total_hours: number | null;
  breaks?: AttendanceBreak[];
}

// ── Leave ────────────────────────────────────────────────────────────────

export interface LeaveType {
  id: string;
  name: string;
  default_allocation: number;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type?: LeaveType;
  remaining_days: number;
}

export interface LeaveRequest {
  id: string;

  employee_id: string;

  leave_type_id: string;

  start_date: string;

  end_date: string;

  reason: string;

  status: LeaveRequestStatus;

  manager_status: "Pending" | "Approved" | "Rejected";

  hr_status: "Pending" | "Approved" | "Rejected";
  manager_comment?: string | null;

  hr_comment?: string | null;

  created_at: string;

  employee?: {
    id: string;

    employee_code: string;

    user?: {
      full_name: string;
      email: string;
    };
  };

  leave_type?: {
    id: string;
    name: string;
  };
}

// ── Goals ────────────────────────────────────────────────────────────────

export interface Goal {
  id: string;
  employee_id: string;
  employee?: Employee;
  title: string;
  description?: string;
  progress: number; // 0-100
  status: GoalStatus;
  target_date: string;
  created_at: string;
  updated_at: string;
}

// ── Performance Reviews ──────────────────────────────────────────────────

export interface ReviewCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: ReviewCycleStatus;
}

export interface ReviewQuestion {
  id: string;
  template_id: string;
  question_text: string;
  weight: number;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  questions?: ReviewQuestion[];
}

export interface ReviewAnswer {
  id: string;
  review_id: string;
  question_id: string;
  question?: ReviewQuestion;
  rating: number; // 1-5
  comment?: string;
}

export interface Review {
  id: string;
  cycle_id: string;
  reviewee_id: string;
  reviewer_id: string;
  type: ReviewType;
  answers?: ReviewAnswer[];
  final_score?: number | null;
  status: "Pending" | "Submitted" | "Published";
}

export interface AppNotification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;

  type?: string;
  link?: string;

  reference_type?: string;
  reference_id?: string;
}
export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity: string;
  entity_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  created_at: string;
}

// ── API envelope shapes ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
// ── Dashboard ────────────────────────────────────────────────────────────

export interface DashboardKpis {
  total_employees: number;
  active_today: number;
  on_leave_today: number;
  pending_leave_approvals: number;
  goals_in_progress: number;
  goals_achieved_this_quarter: number;
  active_review_cycle: {
    id: string;
    name: string;
    pending_reviews_count: number;
  } | null;
  attendance_trend: {
    date: string;
    present: number;
    absent: number;
    late: number;
  }[];
}
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
