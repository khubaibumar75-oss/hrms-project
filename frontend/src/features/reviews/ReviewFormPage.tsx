import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/common/Loader";
import {
  useMyReviews,
  useReview,
  useReviewCycles,
  useSaveReviewDraft,
  useSubmitReview,
} from "./reviewApi";
import {
  reviewDraftSchema,
  type ReviewDraftFormValues,
} from "@/schemas/review.schema";
import type { Review, ReviewType } from "@/types";

const REVIEW_TYPES: ReviewType[] = ["Self", "Peer", "Manager"];

function statusPillClass(status: Review["status"]) {
  switch (status) {
    case "Published":
    case "Submitted":
      return "status-pill status-pill-success";
    case "Pending":
      return "status-pill status-pill-warning";
    default:
      return "status-pill status-pill-muted";
  }
}

function RatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="p-0.5 disabled:cursor-not-allowed"
          aria-label={`Rate ${n} out of 5`}
        >
          <Star
            className={`h-5 w-5 ${n <= value ? "fill-accent text-accent" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewFormPage() {
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [activeTab, setActiveTab] = useState<ReviewType>("Self");
  const [activeReviewId, setActiveReviewId] = useState("");

  const { data: cycles, isLoading: cyclesLoading } = useReviewCycles();
  const { data: myReviews, isLoading: myReviewsLoading } =
    useMyReviews(selectedCycleId);

  useEffect(() => {
    if (cycles && cycles.length > 0 && !selectedCycleId) {
      const active = cycles.find((c) => c.status === "Active") ?? cycles[0];
      setSelectedCycleId(active.id);
    }
  }, [cycles, selectedCycleId]);

  const reviewsByType = useMemo(() => {
    if (!myReviews) return [];
    return myReviews.filter((r) => r.type === activeTab);
  }, [myReviews, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Performance Reviews
        </h1>
        <Select
          value={selectedCycleId ?? ""}
          onValueChange={setSelectedCycleId}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select review cycle" />
          </SelectTrigger>
          <SelectContent>
            {cycles?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} · {c.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(cyclesLoading || myReviewsLoading) && <Loader />}

      {!cyclesLoading && cycles?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No review cycles have been published yet.
        </p>
      )}

      {myReviews && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ReviewType)}
        >
          <TabsList>
            {REVIEW_TYPES.map((t) => (
              <TabsTrigger key={t} value={t}>
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {REVIEW_TYPES.map((t) => (
            <TabsContent key={t} value={t} className="space-y-3">
              {t === activeTab && reviewsByType.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No {t.toLowerCase()} reviews assigned for this cycle.
                </p>
              )}
              {t === activeTab &&
                reviewsByType.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveReviewId(r.id)}
                    className={`reporting-line w-full rounded-md border bg-card p-4 text-left transition hover:bg-muted/50 ${
                      activeReviewId === r.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {r.reviewee_name ?? r.reviewee_id}
                      </span>
                      <span className={statusPillClass(r.status)}>
                        {r.status}
                      </span>
                    </div>
                    {r.final_score != null && (
                      <span className="font-mono text-xs text-muted-foreground">
                        Score: {r.final_score.toFixed(2)} / 5
                      </span>
                    )}
                  </button>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {activeReviewId && selectedCycleId && (
        <ReviewAnswerForm reviewId={activeReviewId} cycleId={selectedCycleId} />
      )}
    </div>
  );
}

function ReviewAnswerForm({
  reviewId,
  cycleId,
}: {
  reviewId: string;
  cycleId: string;
}) {
  const { data: review, isLoading } = useReview(reviewId);
  const saveDraft = useSaveReviewDraft(reviewId);
  const submitReview = useSubmitReview(reviewId, cycleId);

  const { control, handleSubmit, watch, reset } = useForm<
    ReviewDraftFormValues,
    any,
    ReviewDraftFormValues
  >({
    resolver: zodResolver(reviewDraftSchema),
    defaultValues: { answers: [] },
  });
  const { fields } = useFieldArray({ control, name: "answers" });
  const watchedAnswers = watch("answers");

  useEffect(() => {
    if (!review?.template?.questions) return;
    reset({
      answers: review.template.questions.map((q) => {
        const existing = review.answers?.find((a) => a.question_id === q.id);
        return {
          question_id: q.id,
          rating: existing?.rating ?? 0,
          comment: existing?.comment ?? "",
        };
      }),
    });
  }, [review, reset]);

  const liveScore = useMemo(() => {
    if (!review?.template?.questions) return null;
    let weightedSum = 0;
    let weightTotal = 0;
    review.template.questions.forEach((q, idx) => {
      const rating = watchedAnswers?.[idx]?.rating ?? 0;
      if (rating > 0) {
        weightedSum += rating * q.weight;
        weightTotal += q.weight;
      }
    });
    return weightTotal > 0 ? weightedSum / weightTotal : null;
  }, [review, watchedAnswers]);

  if (isLoading || !review || !review.template?.questions) return <Loader />;

  // Only Pending is editable — Submitted/Published are read-only per your Review type
  const isLocked = review.status !== "Pending";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">
          {review.type} Review — {review.reviewee_name ?? review.reviewee_id}
        </CardTitle>
        <div className="flex items-center gap-3">
          {liveScore !== null && (
            <span className="font-mono text-sm">
              Live score: <strong>{liveScore.toFixed(2)}</strong> / 5
            </span>
          )}
          <span className={statusPillClass(review.status)}>
            {review.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, idx) => {
          const question = review.template.questions![idx];
          return (
            <div
              key={field.id}
              className="space-y-2 border-b pb-4 last:border-0"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium">{question.question_text}</p>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  weight {question.weight}
                </span>
              </div>
              <Controller
                control={control}
                name={`answers.${idx}.rating`}
                render={({ field: f }) => (
                  <RatingInput
                    value={Number(f.value)}
                    onChange={f.onChange}
                    disabled={isLocked}
                  />
                )}
              />
              <Controller
                control={control}
                name={`answers.${idx}.comment`}
                render={({ field: f }) => (
                  <Textarea
                    placeholder="Comment (optional)"
                    disabled={isLocked}
                    {...f}
                  />
                )}
              />
            </div>
          );
        })}

        {!isLocked && (
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit((values: ReviewDraftFormValues) =>
                saveDraft.mutate(values),
              )}
              disabled={saveDraft.isPending}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={handleSubmit((values: ReviewDraftFormValues) =>
                submitReview.mutate(values),
              )}
              disabled={submitReview.isPending}
            >
              Submit Review
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
