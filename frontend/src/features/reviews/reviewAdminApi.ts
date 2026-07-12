import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import type { ApiResponse, ReviewCycle, ReviewCycleStatus } from "@/types";
import type { ReviewTemplateFormValues, ReviewCycleFormValues } from "@/schemas/reviewCycle.schema";

export interface ReviewTemplateSummary {
  id: string;
  name: string;
  questions: { id: string; question_text: string; weight: number }[];
}

const KEYS = {
  templates: ["review-templates"] as const,
  cycles: ["review-cycles"] as const,
};

async function fetchTemplates() {
  const { data } = await axiosInstance.get<ApiResponse<ReviewTemplateSummary[]>>("/review-templates");
  return data.data;
}
async function createTemplate(payload: ReviewTemplateFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<ReviewTemplateSummary>>(
    "/review-templates",
    payload
  );
  return data.data;
}

async function fetchCycles() {
  const { data } = await axiosInstance.get<ApiResponse<ReviewCycle[]>>("/review-cycles");
  return data.data;
}
async function createCycle(payload: ReviewCycleFormValues) {
  const { data } = await axiosInstance.post<ApiResponse<ReviewCycle>>("/review-cycles", payload);
  return data.data;
}
async function updateCycleStatus({ id, status }: { id: string; status: ReviewCycleStatus }) {
  const { data } = await axiosInstance.patch<ApiResponse<ReviewCycle>>(
    `/review-cycles/${id}/status`,
    { status }
  );
  return data.data;
}

export function useReviewTemplates() {
  return useQuery({ queryKey: KEYS.templates, queryFn: fetchTemplates });
}
export function useCreateReviewTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export function useReviewCycles() {
  return useQuery({ queryKey: KEYS.cycles, queryFn: fetchCycles });
}
export function useCreateReviewCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCycle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.cycles }),
  });
}
export function useUpdateReviewCycleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCycleStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.cycles }),
  });
}