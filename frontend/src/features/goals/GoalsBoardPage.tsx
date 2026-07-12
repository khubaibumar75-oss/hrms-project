import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, Target, CheckCircle2, XCircle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
} from "@/components/ui/dialog";
import Loader from "@/components/common/Loader";
import { useAuthStore } from "@/features/auth/useAuthStore";
import { createGoalSchema, goalProgressSchema, type CreateGoalFormValues, type GoalProgressFormValues } from "@/schemas/goal.schema";
import { useGoals, useMyTeam, useCreateGoal, useUpdateGoalProgress, useValidateGoal } from "./goalsApi";
import type { Goal, GoalStatus } from "@/types";
import { cn } from "@/lib/utils";

const COLUMNS: { status: GoalStatus; label: string }[] = [
  { status: "Not Started", label: "Not started" },
  { status: "In Progress", label: "In progress" },
  { status: "Achieved", label: "Achieved" },
  { status: "Deferred", label: "Deferred" },
];

const MANAGER_ROLES = ["Super Admin", "HR Manager", "Department Manager"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

function isOverdue(goal: Goal) {
  return goal.status !== "Achieved" && new Date(goal.target_date).getTime() < Date.now();
}

function GoalCard({
  goal,
  canEditProgress,
  canValidate,
  onEditProgress,
  onValidate,
}: {
  goal: Goal;
  canEditProgress: boolean;
  canValidate: boolean;
  onEditProgress: () => void;
  onValidate: (approved: boolean) => void;
}) {
  const pendingValidation = goal.progress >= 100 && goal.status !== "Achieved";

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm",
        pendingValidation ? "border-accent/50 bg-accent/5" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-foreground">{goal.title}</h3>
        {pendingValidation && (
          <span className="status-pill status-pill-warning shrink-0">Needs review</span>
        )}
      </div>

      {goal.employee?.user?.full_name && (
        <p className="mt-1 text-xs text-muted-foreground">{goal.employee.user.full_name}</p>
      )}

      {goal.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{goal.description}</p>
      )}

      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-mono font-medium text-foreground">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-1.5" />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            isOverdue(goal) ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <CalendarClock className="h-3 w-3" />
          {formatDate(goal.target_date)}
        </span>

        {canValidate && pendingValidation ? (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onValidate(false)}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-success hover:bg-success/10 hover:text-success"
              onClick={() => onValidate(true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : canEditProgress && goal.status !== "Achieved" ? (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEditProgress}>
            Update
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function GoalsBoardPage() {
  const roleName = useAuthStore((s) => s.user?.role?.name);
  const isManager = !!roleName && MANAGER_ROLES.includes(roleName);

  const { data: goals, isLoading } = useGoals();
  const { data: team } = useMyTeam(isManager);
  const createMutation = useCreateGoal();
  const progressMutation = useUpdateGoalProgress();
  const validateMutation = useValidateGoal();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const createForm = useForm<CreateGoalFormValues>({ resolver: zodResolver(createGoalSchema) });
  const progressForm = useForm<GoalProgressFormValues>({ resolver: zodResolver(goalProgressSchema) });

  const grouped = useMemo(() => {
    const map: Record<GoalStatus, Goal[]> = {
      "Not Started": [],
      "In Progress": [],
      Achieved: [],
      Deferred: [],
    };
    goals?.forEach((g) => map[g.status]?.push(g));
    return map;
  }, [goals]);

  const openProgressDialog = (goal: Goal) => {
    setProgressGoal(goal);
    setSliderValue(goal.progress);
    progressForm.reset({ progress: goal.progress, comment: "" });
  };

  const onSubmitProgress = (values: GoalProgressFormValues) => {
    if (!progressGoal) return;
    progressMutation.mutate(
      { id: progressGoal.id, ...values, progress: sliderValue },
      { onSuccess: () => setProgressGoal(null) }
    );
  };

  const onSubmitCreate = (values: CreateGoalFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        createForm.reset();
        setIsCreateOpen(false);
      },
    });
  };

  if (isLoading) return <Loader label="Loading goals…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Goals
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isManager
              ? "Set objectives for your team and validate ones that hit 100%."
              : "Track progress on what you're working toward."}
          </p>
        </div>

        {isManager && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New goal</DialogTitle>
                <DialogDescription>Assign a tactical objective to someone on your team.</DialogDescription>
              </DialogHeader>
              <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="employee_id">Assign to</Label>
                  <Controller
                    name="employee_id"
                    control={createForm.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="employee_id">
                          <SelectValue placeholder="Select a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {team?.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.user.full_name} · {member.employee_code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {createForm.formState.errors.employee_id && (
                    <p className="text-xs text-destructive">
                      {createForm.formState.errors.employee_id.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g. Ship the Q3 reporting dashboard" {...createForm.register("title")} />
                  {createForm.formState.errors.title && (
                    <p className="text-xs text-destructive">{createForm.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} placeholder="Optional context…" {...createForm.register("description")} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target_date">Target date</Label>
                  <Input id="target_date" type="date" {...createForm.register("target_date")} />
                  {createForm.formState.errors.target_date && (
                    <p className="text-xs text-destructive">{createForm.formState.errors.target_date.message}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create goal
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!goals?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Target className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {isManager ? "No goals set yet — create one to get started." : "No goals assigned to you yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="space-y-3">
              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {col.label}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  {grouped[col.status].length}
                </span>
              </div>
              <div className="space-y-3">
                {grouped[col.status].map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    canEditProgress={!isManager}
                    canValidate={isManager}
                    onEditProgress={() => openProgressDialog(goal)}
                    onValidate={(approved) => validateMutation.mutate({ id: goal.id, approved })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!progressGoal} onOpenChange={(open) => !open && setProgressGoal(null)}>
        <DialogContent>
          <form onSubmit={progressForm.handleSubmit(onSubmitProgress)} noValidate>
            <DialogHeader>
              <DialogTitle>Update progress</DialogTitle>
              <DialogDescription>{progressGoal?.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Progress</Label>
                  <span className="font-mono font-medium text-foreground">{sliderValue}%</span>
                </div>
                <Slider
                  value={[sliderValue]}
                  onValueChange={([v]) => setSliderValue(v)}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comment">What changed?</Label>
                <Textarea
                  id="comment"
                  rows={3}
                  placeholder="e.g. Finished the backend integration, UI review scheduled next week"
                  {...progressForm.register("comment")}
                />
                {progressForm.formState.errors.comment && (
                  <p className="text-xs text-destructive">{progressForm.formState.errors.comment.message}</p>
                )}
              </div>

              {sliderValue >= 100 && (
                <p className="rounded-md bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
                  Setting this to 100% will send it to your manager for validation.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={progressMutation.isPending}>
                {progressMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}