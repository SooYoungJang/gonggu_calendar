import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "@tanstack/react-query";
import { apiClient } from "../utils/api-client";
import type { GroupBuy, GroupBuyAdmin } from "../schemas/group-buy";
import type { CalendarGroupBuyResponse } from "../schemas/group-buy";
import type { Influencer, InfluencerForm } from "../schemas/influencer";
import type { Submission, SubmissionForm, SubmissionReviewForm, SubmissionAction } from "../schemas/submission";
import { groupBuysResponseSchema } from "../schemas/group-buy";
import { calendarGroupBuyResponseSchema } from "../schemas/group-buy";
import { influencersResponseSchema } from "../schemas/influencer";
import { submissionsResponseSchema } from "../schemas/submission";

export const QUERY_KEYS = {
  groupBuys: ["group-buys"] as const,
  groupBuy: (id: string) => ["group-buys", id] as const,
  calendarGroupBuys: (year: number, month: number) => ["group-buys", "calendar", year, month] as const,
  adminGroupBuys: ["admin", "group-buys"] as const,
  influencers: ["admin", "influencers"] as const,
  submissions: ["admin", "submissions"] as const,
  submission: (id: string) => ["admin", "submissions", id] as const,
} as const;

export function useGroupBuys(options?: Partial<UseQueryOptions<GroupBuy[], Error>>) {
  return useQuery({
    queryKey: QUERY_KEYS.groupBuys,
    queryFn: async () => {
      const response = await apiClient.get<unknown>("/group-buys");
      return groupBuysResponseSchema.parse(response);
    },
    // Retry on 401/403 errors
    retry: (failureCount, error: Error) => {
      if (failureCount < 2 && (error.message.includes("401") || error.message.includes("403"))) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
    ...options,
  });
}

export function useCalendarGroupBuys(
  year: number,
  month: number,
  options?: Partial<UseQueryOptions<CalendarGroupBuyResponse, Error>>,
) {
  return useQuery({
    queryKey: QUERY_KEYS.calendarGroupBuys(year, month),
    queryFn: async () => {
      const response = await apiClient.get<unknown>(`/group-buys/calendar?year=${year}&month=${month}`);
      return calendarGroupBuyResponseSchema.parse(response);
    },
    ...options,
  });
}

export function useAdminGroupBuys(options?: Partial<UseQueryOptions<GroupBuyAdmin[], Error>>) {
  return useQuery({
    queryKey: QUERY_KEYS.adminGroupBuys,
    queryFn: async () => {
      const response = await apiClient.get<unknown>("/admin/group-buys");
      return response as GroupBuyAdmin[];
    },
    ...options,
  });
}

export function useInfluencers(options?: Partial<UseQueryOptions<Influencer[], Error>>) {
  return useQuery({
    queryKey: QUERY_KEYS.influencers,
    queryFn: async () => {
      const response = await apiClient.get<unknown>("/admin/influencers");
      return influencersResponseSchema.parse(response);
    },
    ...options,
  });
}

export function useSubmissions(options?: Partial<UseQueryOptions<Submission[], Error>>) {
  return useQuery({
    queryKey: QUERY_KEYS.submissions,
    queryFn: async () => {
      const response = await apiClient.get<{ items: Submission[]; total: number }>("/admin/submissions");
      const parsed = submissionsResponseSchema.parse(response);
      return parsed.items;
    },
    // Retry on 401 errors (token might have been set after initial render)
    retry: (failureCount, error: Error) => {
      if (failureCount < 2 && error.message.includes("401")) {
        return true;
      }
      return false;
    },
    retryDelay: 1000,
    ...options,
  });
}

export function useCreateInfluencer(
  options?: Partial<UseMutationOptions<Influencer, Error, InfluencerForm>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InfluencerForm) => {
      const response = await apiClient.post<Influencer>("/admin/influencers", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.influencers });
    },
    ...options,
  });
}

export function useDeactivateInfluencer(
  options?: Partial<UseMutationOptions<void, Error, string>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/influencers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.influencers });
    },
    ...options,
  });
}

export function useCreateSubmission(
  options?: Partial<UseMutationOptions<Submission, Error, SubmissionForm>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SubmissionForm) => {
      const response = await apiClient.post<Submission>("/admin/submissions", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
    ...options,
  });
}

export function useUpdateSubmission(
  options?: Partial<UseMutationOptions<Submission, Error, { id: string; data: SubmissionReviewForm }>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubmissionReviewForm }) => {
      const response = await apiClient.patch<Submission>(`/admin/submissions/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
    ...options,
  });
}

export function useModerateSubmission(
  options?: Partial<UseMutationOptions<Submission, Error, { id: string; action: SubmissionAction }>>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: SubmissionAction }) => {
      const response = await apiClient.post<Submission>(
        `/admin/submissions/${id}/${action.action}`,
        action.reason ? { reason: action.reason } : undefined
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminGroupBuys });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupBuys });
    },
    ...options,
  });
}