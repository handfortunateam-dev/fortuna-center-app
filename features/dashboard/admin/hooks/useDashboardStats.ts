"use client";

import { useClasses } from "@/services/classesService";
import { useStudents } from "@/services/studentsService";
import { useQuery } from "@tanstack/react-query";
import { getChannelStatistics, checkQuotaHealth } from "@/services/youtubeService";
import { useMemo } from "react";

// This is a mock/placeholder for broadcast-specific analytics until we have a real service
const broadcastChannelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "";

const CACHE_STALE_TIME = 1000 * 60 * 15; // 15 minutes
const CACHE_GC_TIME = 1000 * 60 * 30; // 30 minutes

export function useDashboardStats() {
    // Stabilize parameters to ensure stable query keys
    const classesParams = useMemo(() => ({ limit: 100 }), []);
    const studentsParams = useMemo(() => ({ limit: 1 }), []);

    const { data: classesResponse, isLoading: classesLoading } = useClasses(classesParams);
    const { data: studentsResponse, isLoading: studentsLoading } = useStudents(studentsParams);

    // YouTube Stats
    const { data: ytStats, isLoading: ytLoading } = useQuery({
        queryKey: ["youtube-stats", broadcastChannelId],
        queryFn: () => getChannelStatistics(broadcastChannelId),
        enabled: !!broadcastChannelId,
        staleTime: CACHE_STALE_TIME,
        gcTime: CACHE_GC_TIME,
    });

    // Quota health
    const { data: quotaStatus } = useQuery({
        queryKey: ["youtube-quota-health"],
        queryFn: () => checkQuotaHealth(),
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 2, // 2 hours
    });

    const isLoading = classesLoading || studentsLoading || ytLoading;

    const totalClasses = classesResponse?.total || classesResponse?.data?.length || 0;
    const activeClasses = classesResponse?.data?.filter(c => c.isActive).length || 0;

    const totalStudents = (studentsResponse as any)?.total || (studentsResponse as any)?.data?.length || 0;

    return {
        lms: {
            totalClasses,
            activeClasses,
            totalStudents,
            isLoading: classesLoading || studentsLoading,
        },
        broadcast: {
            subscribers: ytStats?.subscriberCount || "0",
            totalViews: ytStats?.viewCount || "0",
            videoCount: ytStats?.videoCount || "0",
            isQuotaExceeded: quotaStatus?.status === 'quota_exceeded',
            isLoading: ytLoading,
        },
        overallLoading: isLoading,
    };
}
