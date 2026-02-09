"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { BlogPost, BlogCategory, BlogTag, CreateBlogPostData } from "@/features/blog/interfaces";

// Public Blog Service
export function useBlogPosts(filters?: { q?: string; status?: string }) {
    return useQuery({
        queryKey: ["public-posts", filters],
        queryFn: async () => {
            const { data } = await apiClient.get("/blog/posts", {
                params: {
                    ...filters,
                    status: filters?.status || "published", // Default to published for public
                },

            });
            return data.data as BlogPost[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useBlogCategories() {
    return useQuery({
        queryKey: ["blog-categories"],
        queryFn: async () => {
            const { data } = await apiClient.get("/blog-cms/categories");
            return data.data as BlogCategory[];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useBlogTags() {
    return useQuery({
        queryKey: ["blog-tags"],
        queryFn: async () => {
            const { data } = await apiClient.get("/blog-cms/tags");
            return data.data as BlogTag[];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

export function useBlogPostDetail(id?: string) {
    return useQuery({
        queryKey: ["post-detail", id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog-cms/posts/${id}`);
            return data.data as BlogPost;
        },
        enabled: !!id,
    });
}

export function useBlogPostBySlug(slug?: string) {
    return useQuery({
        queryKey: ["post-detail-slug", slug],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog-cms/posts/slug/${slug}`);
            return data.data as BlogPost;
        },
        enabled: !!slug,
    });
}

export function useCreateBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postData: CreateBlogPostData) => {
            const { data } = await apiClient.post("/blog-cms/posts", postData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["public-posts"] });
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] }); // Assuming admin posts use this key
        },
    });
}

// Like toggling for blog posts
export function useToggleLike() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, visitorId }: { postId: string; visitorId: string }) => {
            const { data } = await apiClient.post(`/blog-cms/posts/${postId}/like`, { visitorId });
            return data as { success: boolean; liked: boolean; likeCount: number };
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["post-detail-slug"] });
            queryClient.invalidateQueries({ queryKey: ["post-detail", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["public-posts"] });
        },
    });
}

export function useCheckLikeStatus(postId?: string, visitorId?: string) {
    return useQuery({
        queryKey: ["post-like-status", postId, visitorId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog-cms/posts/${postId}/like`, {
                params: { visitorId },
            });
            return data as { success: boolean; liked: boolean };
        },
        enabled: !!postId && !!visitorId,
    });
}

// Comments for blog posts
export interface PostCommentData {
    id: string;
    content: string;
    createdAt: string;
    isEdited: boolean;
    parentId: string | null;
    author: {
        id: string;
        name: string;
        image: string | null;
    };
    replies: PostCommentData[];
}

export function usePostComments(postId?: string) {
    return useQuery({
        queryKey: ["post-comments", postId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/blog-cms/posts/${postId}/comments`);
            return data.data as PostCommentData[];
        },
        enabled: !!postId,
    });
}

export function useCreateComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
            const { data } = await apiClient.post(`/blog-cms/posts/${postId}/comments`, { content, parentId });
            return data.data as PostCommentData;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
        },
    });
}

export function useDeleteComment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
            const { data } = await apiClient.delete(`/blog-cms/comments/${commentId}`);
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["post-comments", variables.postId] });
        },
    });
}
