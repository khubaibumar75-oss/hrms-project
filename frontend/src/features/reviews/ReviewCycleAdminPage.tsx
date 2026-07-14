import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Loader2, FileText, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  reviewTemplateSchema,
  reviewCycleSchema,
  type ReviewTemplateFormValues,
  type ReviewCycleFormValues,
} from "@/schemas/reviewCycle.schema";
import {
  useReviewTemplates,
  useCreateReviewTemplate,
  useReviewCycles,
  useCreateReviewCycle,
  useUpdateReviewCycleStatus,
} from "./reviewAdminApi";
import type { ReviewCycle, ReviewCycleStatus } from "@/types";

function statusPillClass(status: ReviewCycleStatus) {
  switch (status) {
    case "Draft":
      return "status-pill status-pill-muted";
    case "Active":
      return "status-pill status-pill-info";
    case "Closed":
      return "status-pill status-pill-warning";
    case "Published":
      return "status-pill status-pill-success";
  }
}

const NEXT_STATUS: Record<
  ReviewCycleStatus,
  { next: ReviewCycleStatus; label: string; description: string } | null
> = {
  Draft: {
    next: "Active",
    label: "Launch cycle",
    description:
      "This generates self, peer, and manager review assignments for every active employee using the linked template. This can't be undone.",
  },
  Active: {
    next: "Closed",
    label: "Close cycle",
    description:
      "Reviewers will no longer be able to submit or edit their responses.",
  },
  Closed: {
    next: "Published",
    label: "Publish scores",
    description:
      "Calculates the final weighted score for every review and makes results visible to employees.",
  },
  Published: null,
};

function NewTemplateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createMutation = useCreateReviewTemplate();
  const defaultValues: ReviewTemplateFormValues = {
    name: "",
    questions: [{ question_text: "", weight: 1 }],
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReviewTemplateFormValues>({
    resolver: zodResolver(reviewTemplateSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });
  const questions = watch("questions");
  const totalWeight =
    questions?.reduce((sum, q) => sum + (Number(q.weight) || 0), 0) ?? 0;

  const onSubmit = (values: ReviewTemplateFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) reset(defaultValues);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New review template</DialogTitle>
          <DialogDescription>
            Score = Σ(Rating×Weight)/ΣWeight — weights just need to reflect
            relative importance, they don't need to add up to any particular
            number.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              placeholder="e.g. Engineering — Mid-year 2026"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <span className="font-mono text-xs text-muted-foreground">
                Total weight: {totalWeight}
              </span>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 rounded-md border border-border p-3"
              >
                <div className="flex-1 space-y-1.5">
                  <Textarea
                    rows={2}
                    placeholder="e.g. Delivers work on time and to spec"
                    {...register(`questions.${index}.question_text` as const)}
                  />
                  {errors.questions?.[index]?.question_text && (
                    <p className="text-xs text-destructive">
                      {errors.questions[index]?.question_text?.message}
                    </p>
                  )}
                </div>
                <div className="w-20 space-y-1.5">
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    placeholder="Weight"
                    {...register(`questions.${index}.weight` as const)}
                  />
                  {errors.questions?.[index]?.weight && (
                    <p className="text-xs text-destructive">
                      {errors.questions[index]?.weight?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                  aria-label="Remove question"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ question_text: "", weight: 1 })}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add question
            </Button>
            {errors.questions?.message && (
              <p className="text-xs text-destructive">
                {errors.questions.message}
              </p>
            )}
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {(createMutation.error as any)?.response?.data?.message ??
                "Couldn't create the template. Try again."}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesTab() {
  const { data: templates, isLoading } = useReviewTemplates();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) return <Loader label="Loading templates…" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      {!templates?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No templates yet — create one before launching a cycle.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="reporting-line rounded-lg border border-border bg-card p-4 pl-[calc(1rem+2px)]"
            >
              <p className="font-medium text-foreground">{template.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {template.questions.length} question
                {template.questions.length === 1 ? "" : "s"} · total weight{" "}
                {template.questions.reduce((sum, q) => sum + q.weight, 0)}
              </p>
            </div>
          ))}
        </div>
      )}

      <NewTemplateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

function NewCycleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: templates } = useReviewTemplates();
  const createMutation = useCreateReviewCycle();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewCycleFormValues>({
    resolver: zodResolver(reviewCycleSchema),
  });

  const onSubmit = (values: ReviewCycleFormValues) => {
    createMutation.mutate(values, {
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
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>New review cycle</DialogTitle>
            <DialogDescription>
              Starts in Draft — nothing happens until you launch it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cycle-name">Cycle name</Label>
              <Input
                id="cycle-name"
                placeholder="e.g. H1 2026 Performance Review"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cycle-template">Template</Label>
              <Controller
                name="template_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="cycle-template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.template_id && (
                <p className="text-xs text-destructive">
                  {errors.template_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cycle-start">Start date</Label>
                <Input
                  id="cycle-start"
                  type="date"
                  {...register("start_date")}
                />
                {errors.start_date && (
                  <p className="text-xs text-destructive">
                    {errors.start_date.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cycle-end">End date</Label>
                <Input id="cycle-end" type="date" {...register("end_date")} />
                {errors.end_date && (
                  <p className="text-xs text-destructive">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create cycle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CyclesTab() {
  const { data: cycles, isLoading } = useReviewCycles();
  const statusMutation = useUpdateReviewCycleStatus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmCycle, setConfirmCycle] = useState<ReviewCycle | null>(null);

  const transition = confirmCycle ? NEXT_STATUS[confirmCycle.status] : null;

  if (isLoading) return <Loader label="Loading review cycles…" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New cycle
        </Button>
      </div>

      {!cycles?.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <CalendarRange className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No review cycles yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Cycle</th>
                <th className="px-4 py-2.5">Dates</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycles.map((cycle) => {
                const cycleTransition = NEXT_STATUS[cycle.status];
                return (
                  <tr key={cycle.id}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {cycle.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {new Date(cycle.start_date).toLocaleDateString()} –{" "}
                      {new Date(cycle.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusPillClass(cycle.status)}>
                        {cycle.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {cycleTransition && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmCycle(cycle)}
                        >
                          {cycleTransition.label}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NewCycleDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      <ConfirmDialog
        open={!!confirmCycle}
        onOpenChange={(open) => !open && setConfirmCycle(null)}
        title={transition?.label ?? ""}
        description={transition?.description ?? ""}
        confirmLabel={transition?.label ?? "Confirm"}
        isLoading={statusMutation.isPending}
        onConfirm={() => {
          if (!confirmCycle || !transition) return;
          statusMutation.mutate(
            { id: confirmCycle.id, status: transition.next },
            { onSuccess: () => setConfirmCycle(null) },
          );
        }}
      />
    </div>
  );
}

export default function ReviewCycleAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Review cycles
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Build templates and launch performance review cycles across the org.
        </p>
      </div>

      <Tabs defaultValue="cycles">
        <TabsList>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="cycles" className="mt-4">
          <CyclesTab />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
