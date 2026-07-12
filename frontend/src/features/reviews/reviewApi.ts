import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, Review, ReviewCycle, ReviewTemplate } from "@/types";
import type { ReviewDraftFormValues, ReviewSubmissionFormValues } from "@/schemas/review.schema";

export interface ReviewWithMeta extends Review {
  reviewee_name?: string;
  template: ReviewTemplate;
}

export const reviewKeys = {
  all: ["reviews"] as const,
  cycles: () => [...reviewKeys.all, "cycles"] as const,
  myReviews: (cycleId: string) => [...reviewKeys.all, "my-reviews", cycleId] as const,
  detail: (reviewId: string) => [...reviewKeys.all, "detail", reviewId] as const,
};

export function useReviewCycles() {
  return useQuery({
    queryKey: reviewKeys.cycles(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ReviewCycle[]>>("/reviews/cycles");
      return data.data;
    },
  });
}

export function useMyReviews(cycleId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.myReviews(cycleId ?? ""),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ReviewWithMeta[]>>(
        `/reviews/cycles/${cycleId}/my-reviews`
      );
      return data.data;
    },
    enabled: !!cycleId,
  });
}

export function useReview(reviewId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId ?? ""),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<ReviewWithMeta>>(`/reviews/${reviewId}`);
      return data.data;
    },
    enabled: !!reviewId,
  });
}

export function useSaveReviewDraft(reviewId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ReviewDraftFormValues) => {
      const { data } = await axiosInstance.patch<ApiResponse<Review>>(
        `/reviews/${reviewId}/draft`,
        values
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
    },
  });
}

export function useSubmitReview(reviewId: string, cycleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: ReviewSubmissionFormValues) => {
      const { data } = await axiosInstance.post<ApiResponse<Review>>(
        `/reviews/${reviewId}/submit`,
        values
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.myReviews(cycleId) });
    },
  });
}