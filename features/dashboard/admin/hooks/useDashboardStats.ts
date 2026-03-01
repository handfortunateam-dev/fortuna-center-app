"use client";

import { useClasses } from "@/services/classesService";
import { useStudents } from "@/services/studentsService";
import { useTeachers } from "@/services/teachersService";
import { useUsers } from "@/services/usersService";
import { useSchedules } from "@/services/schedulerService";
import { useMemo } from "react";

export function useDashboardStats() {
    // Stabilize parameters to ensure stable query keys
    const listParams = useMemo(() => ({ limit: 100 }), []);

    const { data: classesResponse, isLoading: classesLoading } = useClasses(listParams);
    const { data: studentsResponse, isLoading: studentsLoading } = useStudents(listParams);
    const { data: teachersResponse, isLoading: teachersLoading } = useTeachers(listParams);
    const { data: usersResponse, isLoading: usersLoading } = useUsers(listParams);
    const { data: schedulesResponse, isLoading: schedulesLoading } = useSchedules();

    const isLoading = classesLoading || studentsLoading || teachersLoading || usersLoading || schedulesLoading;

    type BasicResponse = { totalCount?: number; data?: { isActive?: boolean }[] };

    const totalClasses = (classesResponse as BasicResponse)?.totalCount ?? (classesResponse as BasicResponse)?.data?.length ?? 0;
    const activeClasses = (classesResponse as BasicResponse)?.data?.filter((c) => c.isActive).length || 0;

    const totalStudents = (studentsResponse as BasicResponse)?.totalCount ?? (studentsResponse as BasicResponse)?.data?.length ?? 0;
    const totalTeachers = (teachersResponse as BasicResponse)?.totalCount ?? (teachersResponse as BasicResponse)?.data?.length ?? 0;
    const totalUsers = (usersResponse as BasicResponse)?.totalCount ?? (usersResponse as BasicResponse)?.data?.length ?? 0;
    const totalSchedules = (schedulesResponse as BasicResponse)?.totalCount ?? (schedulesResponse as BasicResponse)?.data?.length ?? 0;

    return {
        lms: {
            totalClasses,
            activeClasses,
            totalStudents,
            isLoading: classesLoading || studentsLoading,
        },
        personnel: {
            totalTeachers,
            totalUsers,
            totalSchedules,
            isLoading: teachersLoading || usersLoading || schedulesLoading,
        },
        overallLoading: isLoading,
    };
}
