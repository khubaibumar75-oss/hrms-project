import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import DataTable, { type DataTableColumn } from "@/components/common/DataTable";
import { useAuthStore } from "@/features/auth/useAuthStore";
import {
  createEmployeeSchema,
  type CreateEmployeeFormValues,
} from "@/schemas/employee.schema";
import { useEmployees } from "./employeeApi";
import {
  useRoles,
  useEmployeeOptions,
  useCreateEmployeeOnboarding,
  useTeamsAdmin,
} from "./adminApi";
import type { Employee, EmployeeStatus, EmploymentType } from "@/types";
import { cn } from "@/lib/utils";

const ONBOARD_ROLES = ["Super Admin", "HR Manager"];
const STATUS_OPTIONS: EmployeeStatus[] = [
  "Active",
  "On Leave",
  "Pending",
  "Terminated",
];
const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Intern",
  "Contractor",
];
const NO_SELECTION = "__none__";

function statusPillClass(status: EmployeeStatus) {
  switch (status) {
    case "Active":
      return "status-pill status-pill-success";
    case "On Leave":
      return "status-pill status-pill-info";
    case "Pending":
      return "status-pill status-pill-warning";
    case "Terminated":
      return "status-pill status-pill-destructive";
  }
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NewEmployeeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: roles } = useRoles();
  const { data: managers } = useEmployeeOptions();
  const createMutation = useCreateEmployeeOnboarding();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createEmployeeSchema),
  });

  const selectedDepartment = watch("department_id");
  const { data: teams } = useTeamsAdmin(selectedDepartment || undefined);

  const onSubmit = (values: CreateEmployeeFormValues) => {
    const payload = {
      ...values,
      department_id:
        values.department_id === NO_SELECTION
          ? undefined
          : values.department_id,
      team_id: values.team_id === NO_SELECTION ? undefined : values.team_id,
      manager_id:
        values.manager_id === NO_SELECTION ? undefined : values.manager_id,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Onboard a new employee</DialogTitle>
          <DialogDescription>
            They'll get an email with a link to verify and set their password.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                placeholder="Jordan Casey"
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="jordan@company.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="Software Engineer II"
                {...register("designation")}
              />
              {errors.designation && (
                <p className="text-xs text-destructive">
                  {errors.designation.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employment_type">Employment type</Label>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="employment_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.employment_type && (
                <p className="text-xs text-destructive">
                  {errors.employment_type.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role_id">System role</Label>
            <Controller
              name="role_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="role_id">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role_id && (
              <p className="text-xs text-destructive">
                {errors.role_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department_id">Department</Label>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? NO_SELECTION}
                  >
                    <SelectTrigger id="department_id">
                      <SelectValue placeholder="None yet" />
                    </SelectTrigger>
                    <SelectContent></SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team_id">Team</Label>
              <Controller
                name="team_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? NO_SELECTION}
                    disabled={
                      !selectedDepartment || selectedDepartment === NO_SELECTION
                    }
                  >
                    <SelectTrigger id="team_id">
                      <SelectValue placeholder="None yet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SELECTION}>None yet</SelectItem>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="manager_id">Reports to</Label>
            <Controller
              name="manager_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? NO_SELECTION}
                >
                  <SelectTrigger id="manager_id">
                    <SelectValue placeholder="No manager yet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SELECTION}>No manager yet</SelectItem>
                    {managers?.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.user.full_name} · {opt.employee_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="joining_date">Joining date</Label>
              <Input
                id="joining_date"
                type="date"
                {...register("joining_date")}
              />
              {errors.joining_date && (
                <p className="text-xs text-destructive">
                  {errors.joining_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                placeholder="85000"
                {...register("salary")}
              />
              {errors.salary && (
                <p className="text-xs text-destructive">
                  {errors.salary.message}
                </p>
              )}
            </div>
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {(createMutation.error as any)?.response?.data?.message ??
                "Couldn't send the invite. Try again."}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const roleName = useAuthStore((s) => s.user?.role?.name);
  const canOnboard = !!roleName && ONBOARD_ROLES.includes(roleName);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({
    field: "full_name",
    direction: "asc",
  });
  const [isNewEmployeeOpen, setIsNewEmployeeOpen] = useState(false);
  const limit = 10;

  const { data, isLoading } = useEmployees({
    page,
    limit,
    search,
    sortBy: sort.field,
    sortDir: sort.direction,
    status: status === "all" ? undefined : (status as EmployeeStatus),
  });

  const columns: DataTableColumn<Employee>[] = [
    {
      key: "full_name",
      header: "Employee",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(row.user?.full_name)}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {row.user?.full_name ?? "—"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.employee_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      render: (row) => <span className="text-sm">{row.designation}</span>,
    },
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.department?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "manager",
      header: "Reports to",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.manager?.user?.full_name ?? "—"}
        </span>
      ),
    },
    {
      key: "employment_type",
      header: "Type",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.employment_type}
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Employees
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {data?.total ?? "—"} people across the organization.
          </p>
        </div>
        {canOnboard && (
          <Button onClick={() => setIsNewEmployeeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New employee
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No employees match these filters."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name or employee code…"
        sort={sort}
        onSortChange={(s) => {
          setSort(s);
          setPage(1);
        }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        limit={limit}
        onPageChange={setPage}
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
        filtersSlot={
          <div className="flex gap-2">
            <Select
              value={departmentId}
              onValueChange={(v) => {
                setDepartmentId(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-[160px]",
                  departmentId !== "all" && "border-primary/40",
                )}
              >
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent></SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-[140px]",
                  status !== "all" && "border-primary/40",
                )}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {canOnboard && (
        <NewEmployeeDialog
          open={isNewEmployeeOpen}
          onOpenChange={setIsNewEmployeeOpen}
        />
      )}
    </div>
  );
}
