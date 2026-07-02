"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type {
  PodcastShowAdmin,
  PodcastShowDetail,
  PodcastEpisodeAdmin,
  PodcastEpisodeDetail,
  PodcastCommentData,
  PodcastCommentAdmin,
  CreatePodcastShowData,
  CreatePodcastEpisodeData,
} from "@/features/podcast-cms/interfaces";

// ─── Admin: Podcast Shows ─────────────────────────────────

export function usePodcastShows(filters?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: ["podcast-shows", filters],
    queryFn: async () => {
      const { data } = await apiClient.get("/podcast-cms/podcasts", { params: filters });
      return data.data as PodcastShowAdmin[];
    },
  });
}

export function usePodcastShowDetail(id?: string) {
  return useQuery({
    queryKey: ["podcast-show-detail", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcast-cms/podcasts/${id}`);
      return data.data as PodcastShowDetail;
    },
    enabled: !!id,
  });
}

export function useCreatePodcastShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (showData: CreatePodcastShowData) => {
      const { data } = await apiClient.post("/podcast-cms/podcasts", showData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
      queryClient.invalidateQueries({ queryKey: ["/podcast-cms/podcasts"] });
    },
  });
}

export function useUpdatePodcastShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...showData }: CreatePodcastShowData & { id: string }) => {
      const { data } = await apiClient.patch(`/podcast-cms/podcasts/${id}`, showData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-show-detail", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["/podcast-cms/podcasts"] });
    },
  });
}

export function useDeletePodcastShow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/podcast-cms/podcasts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-shows"] });
      queryClient.invalidateQueries({ queryKey: ["/podcast-cms/podcasts"] });
    },
  });
}

// ─── Admin: Episodes ───────────────────────────────────────

export function usePodcastEpisodes(podcastId?: string) {
  return useQuery({
    queryKey: ["podcast-episodes", podcastId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcast-cms/podcasts/${podcastId}/episodes`);
      return data.data as PodcastEpisodeAdmin[];
    },
    enabled: !!podcastId,
  });
}

export function usePodcastEpisodeDetail(id?: string) {
  return useQuery({
    queryKey: ["podcast-episode-detail", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcast-cms/episodes/${id}`);
      return data.data as PodcastEpisodeDetail;
    },
    enabled: !!id,
  });
}

export function useCreatePodcastEpisode(podcastId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (episodeData: CreatePodcastEpisodeData) => {
      const { data } = await apiClient.post(`/podcast-cms/podcasts/${podcastId}/episodes`, episodeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes", podcastId] });
      queryClient.invalidateQueries({ queryKey: ["podcast-show-detail", podcastId] });
      // Also invalidate ListGrid's internal query (uses resourcePath as key)
      queryClient.invalidateQueries({ queryKey: [`/podcast-cms/podcasts/${podcastId}/episodes`] });
    },
  });
}

export function useUpdatePodcastEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...episodeData }: CreatePodcastEpisodeData & { id: string }) => {
      const { data } = await apiClient.patch(`/podcast-cms/episodes/${id}`, episodeData);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-episode-detail", variables.id] });
      // Also invalidate ListGrid's internal queries
      queryClient.invalidateQueries({ queryKey: ["/podcast-cms/podcasts"], exact: false });
    },
  });
}

export function useDeletePodcastEpisode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, podcastId }: { id: string; podcastId: string }) => {
      const { data } = await apiClient.delete(`/podcast-cms/episodes/${id}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episodes", variables.podcastId] });
      queryClient.invalidateQueries({ queryKey: ["podcast-show-detail", variables.podcastId] });
      // Also invalidate ListGrid's internal query
      queryClient.invalidateQueries({ queryKey: [`/podcast-cms/podcasts/${variables.podcastId}/episodes`] });
    },
  });
}

// ─── Public ────────────────────────────────────────────────

export function usePublicPodcasts() {
  return useQuery({
    queryKey: ["public-podcasts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/podcasts");
      return data.data as PodcastShowDetail[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicPodcastBySlug(slug?: string) {
  return useQuery({
    queryKey: ["public-podcast-slug", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcasts/slug/${slug}`);
      return data.data as PodcastShowDetail;
    },
    enabled: !!slug,
  });
}

export function usePublicPodcastEpisodes(podcastId?: string, season?: number) {
  return useQuery({
    queryKey: ["public-podcast-episodes", podcastId, season],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcasts/${podcastId}/episodes`, {
        params: season ? { season } : undefined,
      });
      return data.data as PodcastEpisodeDetail[];
    },
    enabled: !!podcastId,
  });
}

export function usePublicEpisodeBySlug(slug?: string) {
  return useQuery({
    queryKey: ["public-episode-slug", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcasts/episodes/slug/${slug}`);
      return data.data as PodcastEpisodeDetail;
    },
    enabled: !!slug,
  });
}

// ─── Comments & Likes ──────────────────────────────────────

export function useEpisodeComments(episodeId?: string) {
  return useQuery({
    queryKey: ["podcast-episode-comments", episodeId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcast-cms/episodes/${episodeId}/comments`);
      return data.data as PodcastCommentData[];
    },
    enabled: !!episodeId,
  });
}

export function useCreateEpisodeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      episodeId,
      content,
      parentId,
    }: {
      episodeId: string;
      content: string;
      parentId?: string;
    }) => {
      const { data } = await apiClient.post(`/podcast-cms/episodes/${episodeId}/comments`, {
        content,
        parentId,
      });
      return data.data as PodcastCommentData;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episode-comments", variables.episodeId] });
    },
  });
}

export function useDeleteEpisodeComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, episodeId }: { commentId: string; episodeId: string }) => {
      const { data } = await apiClient.delete(`/podcast-cms/comments/${commentId}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["podcast-episode-comments", variables.episodeId] });
    },
  });
}

export function useToggleEpisodeLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ episodeId, visitorId }: { episodeId: string; visitorId: string }) => {
      const { data } = await apiClient.post(`/podcast-cms/episodes/${episodeId}/like`, { visitorId });
      return data as { success: boolean; liked: boolean; likeCount: number };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["public-episode-slug"] });
      queryClient.invalidateQueries({ queryKey: ["podcast-episode-detail", variables.episodeId] });
    },
  });
}

export function useCheckEpisodeLikeStatus(episodeId?: string, visitorId?: string) {
  return useQuery({
    queryKey: ["podcast-episode-like-status", episodeId, visitorId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/podcast-cms/episodes/${episodeId}/like`, {
        params: { visitorId },
      });
      return data as { success: boolean; liked: boolean };
    },
    enabled: !!episodeId && !!visitorId,
  });
}
