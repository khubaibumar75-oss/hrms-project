import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Building2, Users2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Loader from "@/components/common/Loader";
import {
  departmentSchema,
  teamSchema,
  type DepartmentFormValues,
  type TeamFormValues,
} from "@/schemas/department.schema";
import {
  useDepartmentsAdmin,
  useCreateDepartment,
  useUpdateDepartment,
  useTeamsAdmin,
  useCreateTeam,
  useUpdateTeam,
  useEmployeeOptions,
} from "./adminApi";
import type { Department, Team } from "@/types";

const NO_MANAGER = "__none__";

// ── Department dialog (create + edit) ────────────────────────────────────

function DepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}) {
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isEditing = !!department;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({ resolver: zodResolver(departmentSchema) });

  const onSubmit = (values: DepartmentFormValues) => {
    const manager_id = values.manager_id === NO_MANAGER ? undefined : values.manager_id;
    if (isEditing) {
      updateMutation.mutate(
        { id: department.id, ...values, manager_id },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate({ ...values, manager_id }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          reset({ name: department?.name ?? "", manager_id: department?.manager_id ?? NO_MANAGER });
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit department" : "New department"}</DialogTitle>
            <DialogDescription>
              {isEditing ? department.name : "Add a new department to the org structure."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="dept-name">Name</Label>
              <Input id="dept-name" placeholder="e.g. Engineering" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dept-manager">Department manager</Label>
              <Controller
                name="manager_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? NO_MANAGER}>
                    <SelectTrigger id="dept-manager">
                      <SelectValue placeholder="No manager assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MANAGER}>No manager assigned</SelectItem>
                      {options?.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.user.full_name} · {opt.employee_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentsTab() {
  const { data: departments, isLoading } = useDepartmentsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (dept: Department) => {
    setEditing(dept);
    setDialogOpen(true);
  };

  if (isLoading) return <Loader label="Loading departments…" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New department
        </Button>
      </div>

      {!departments?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No departments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="reporting-line flex items-start justify-between rounded-lg border border-border bg-card p-4 pl-[calc(1rem+2px)]"
            >
              <div>
                <p className="font-medium text-foreground">{dept.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dept.manager?.user?.full_name ?? "No manager assigned"}
                </p>
              </div>
              <button
                onClick={() => openEdit(dept)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Edit ${dept.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <DepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} department={editing} />
    </div>
  );
}

// ── Team dialog (create + edit) ──────────────────────────────────────────

function TeamDialog({
  open,
  onOpenChange,
  team,
  departments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  departments: Department[];
}) {
  const { data: options } = useEmployeeOptions();
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const isEditing = !!team;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({ resolver: zodResolver(teamSchema) });

  const onSubmit = (values: TeamFormValues) => {
    const lead_id = values.lead_id === NO_MANAGER ? undefined : values.lead_id;
    if (isEditing) {
      updateMutation.mutate({ id: team.id, ...values, lead_id }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate({ ...values, lead_id }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          reset({
            name: team?.name ?? "",
            department_id: team?.department_id ?? "",
            lead_id: team?.lead_id ?? NO_MANAGER,
          });
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit team" : "New team"}</DialogTitle>
            <DialogDescription>{isEditing ? team.name : "Add a team under a department."}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Name</Label>
              <Input id="team-name" placeholder="e.g. Platform Infrastructure" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="team-department">Department</Label>
              <Controller
                name="department_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="team-department">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department_id && (
                <p className="text-xs text-destructive">{errors.department_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="team-lead">Team lead</Label>
              <Controller
                name="lead_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? NO_MANAGER}>
                    <SelectTrigger id="team-lead">
                      <SelectValue placeholder="No lead assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_MANAGER}>No lead assigned</SelectItem>
                      {options?.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          {opt.user.full_name} · {opt.employee_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save changes" : "Create team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamsTab() {
  const { data: departments } = useDepartmentsAdmin();
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const { data: teams, isLoading } = useTeamsAdmin(
    departmentFilter === "all" ? undefined : departmentFilter
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (team: Team) => {
    setEditing(team);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={openCreate} disabled={!departments?.length}>
          <Plus className="mr-2 h-4 w-4" />
          New team
        </Button>
      </div>

      {isLoading ? (
        <Loader label="Loading teams…" />
      ) : !teams?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Users2 className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No teams yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Team</th>
                <th className="px-4 py-2.5">Department</th>
                <th className="px-4 py-2.5">Lead</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{team.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {departments?.find((d) => d.id === team.department_id)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {/* lead name comes through if your GET /teams embeds it; falls back gracefully otherwise */}
                    {(team as any).lead?.user?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(team)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${team.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeamDialog open={dialogOpen} onOpenChange={setDialogOpen} team={editing} departments={departments ?? []} />
    </div>
  );
}

export default function OrgStructurePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Org structure
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Manage departments and teams — this shapes the reporting chains used across the app.
        </p>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>
        <TabsContent value="departments" className="mt-4">
          <DepartmentsTab />
        </TabsContent>
        <TabsContent value="teams" className="mt-4">
          <TeamsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}