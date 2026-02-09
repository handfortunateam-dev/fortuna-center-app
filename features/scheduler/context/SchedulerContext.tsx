"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  DragEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClassSchedule,
  SchedulerView,
  SchedulerFilters,
  SchedulerConfig,
  Teacher,
  ClassRoom,
  ContextMenuState,
} from "../types";
import { DEFAULT_CONFIG } from "../constants";
import {
  getWeekDates,
  checkConflict,
  calculateDuration,
  minutesToTime,
  timeToMinutes,
} from "../utils/timeUtils";
import {
  useSchedules,
  updateSchedule as apiUpdateSchedule,
  deleteSchedule as apiDeleteSchedule,
  schedulerKeys,
} from "@/services/schedulerService";
import { useClasses } from "@/services/classesService";
import { useUsers } from "@/services/usersService";

interface DragState {
  isDragging: boolean;
  draggedSchedule: ClassSchedule | null;
  dragOverSlot: { dayOfWeek: number; time: string } | null;
  canDrop: boolean;
}

interface SchedulerContextType {
  // Data
  schedules: ClassSchedule[];
  teachers: Teacher[];
  classes: ClassRoom[];

  // View state
  currentDate: Date;
  currentView: SchedulerView;
  weekDates: Date[];

  // Filters
  filters: SchedulerFilters;
  filteredSchedules: ClassSchedule[];

  // Config
  config: SchedulerConfig;
  readOnly: boolean;

  // Drag state
  dragState: DragState;

  // Context Menu state
  contextMenu: ContextMenuState;

  // Create Modal state
  createModalState: {
    isOpen: boolean;
    defaultValues: {
      dayOfWeek?: number;
      startTime?: string;
    } | null;
  };
  openCreateModal: (defaults?: {
    dayOfWeek?: number;
    startTime?: string;
    classId?: string;
    endTime?: string;
    location?: string;
    notes?: string;
    existingTeacherIds?: string[];
  }) => void;
  closeCreateModal: () => void;

  // Edit Modal state
  editModalState: {
    isOpen: boolean;
    schedule: ClassSchedule | null;
  };
  openEditModal: (schedule: ClassSchedule) => void;
  closeEditModal: () => void;

  // Detail Modal state
  detailModalState: {
    isOpen: boolean;
    schedule: ClassSchedule | null;
  };
  openDetailModal: (schedule: ClassSchedule) => void;
  closeDetailModal: () => void;

  setCurrentDate: (date: Date | ((prev: Date) => Date)) => void;
  setCurrentView: (view: SchedulerView) => void;
  setFilters: (filters: SchedulerFilters) => void;
  updateSchedule: (
    id: string,
    updates: Partial<ClassSchedule>,
  ) => Promise<boolean>;
  deleteSchedule: (id: string) => Promise<boolean>;
  navigateWeek: (direction: "prev" | "next") => void;
  goToToday: () => void;
  checkScheduleConflict: (
    schedule: Pick<ClassSchedule, "dayOfWeek" | "startTime" | "endTime">,
    excludeId?: string,
  ) => ClassSchedule | null;

  // Drag & Drop handlers
  handleDragStart: (
    e: DragEvent<HTMLDivElement>,
    schedule: ClassSchedule,
  ) => void;
  handleDragEnd: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (
    e: DragEvent<HTMLDivElement>,
    dayOfWeek: number,
    time: string,
  ) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  handleDrop: (
    e: DragEvent<HTMLDivElement>,
    dayOfWeek: number,
    time: string,
  ) => void;

  // Context Menu handlers
  handleContextMenu: (e: React.MouseEvent, schedule: ClassSchedule) => void;
  handleEmptySlotContextMenu: (
    e: React.MouseEvent,
    dayOfWeek: number,
    time: string,
  ) => void;
  closeContextMenu: () => void;
}

const SchedulerContext = createContext<SchedulerContextType | null>(null);

export function SchedulerProvider({
  children,
  readOnly = false,
  initialFilters = {},
}: {
  children: React.ReactNode;
  readOnly?: boolean;
  initialFilters?: SchedulerFilters;
}) {
  const queryClient = useQueryClient();

  // Helper for consistent colors
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Filters
  const [filters, setFilters] = useState<SchedulerFilters>(initialFilters);

  // Fetch Teachers
  const { data: teachersData } = useUsers({ role: "TEACHER", limit: 100 });
  const teachers: Teacher[] = useMemo(() => {
    return (teachersData?.data || []).map((t) => ({
      id: t.id,
      name: t.fullName || t.username || "Unknown",
      // Generate color from ID since custom color is not implemented yet
      color: stringToColor(t.id),
      avatar: t.imageUrl,
    }));
  }, [teachersData]);

  // Data state from API
  const { data: schedulesData } = useSchedules(filters as SchedulerFilters);
  const schedules: ClassSchedule[] = useMemo(() => {
    return (
      ((schedulesData?.data as any[]) || [])?.map((s) => {
        // Find colors for all teachers in this schedule
        const groupedTeachers = ((s.teachers as any[]) || []).map((st) => {
          const teacher = teachers.find((t) => t.id === st.id);
          return {
            ...st,
            color: teacher?.color || stringToColor(st.id || "unknown"),
            avatar: st.image || teacher?.avatar,
          };
        });

        const primaryTeacher = groupedTeachers[0];

        return {
          ...s,
          // Ensure time format is HH:MM
          startTime: (s.startTime as string).substring(0, 5),
          endTime: (s.endTime as string).substring(0, 5),
          teachers: groupedTeachers,
          teacherId: primaryTeacher?.id || "",
          teacherName: primaryTeacher?.name || "No Teacher",
          teacherColor:
            primaryTeacher?.color || stringToColor(s.id || "unknown"),
        } as ClassSchedule;
      }) || []
    );
  }, [schedulesData, teachers]);

  // Fetch Classes
  const { data: classesData } = useClasses({ isActive: true });
  const classes: ClassRoom[] = useMemo(() => {
    return (classesData?.data || []).map((c) => ({
      id: c.id,
      name: c.name,
      level: "N/A",
      maxStudents: 0,
    }));
  }, [classesData]);

  // View state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<SchedulerView>("week");

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSchedule: null,
    dragOverSlot: null,
    canDrop: false,
  });

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    schedule: null,
  });

  // Create Modal state
  const [createModalState, setCreateModalState] = useState<{
    isOpen: boolean;
    defaultValues: { dayOfWeek?: number; startTime?: string } | null;
  }>({
    isOpen: false,
    defaultValues: null,
  });

  // Edit Modal state
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    schedule: ClassSchedule | null;
  }>({
    isOpen: false,
    schedule: null,
  });

  // Detail Modal state
  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    schedule: ClassSchedule | null;
  }>({
    isOpen: false,
    schedule: null,
  });

  // Config
  const config = DEFAULT_CONFIG;

  // ... (existing code for computed values)

  // Create Modal Handlers
  const openCreateModal = useCallback(
    (defaults?: {
      dayOfWeek?: number;
      startTime?: string;
      classId?: string;
      endTime?: string;
      location?: string;
      notes?: string;
      existingTeacherIds?: string[];
    }) => {
      setCreateModalState({
        isOpen: true,
        defaultValues: defaults || null,
      });
    },
    [],
  );

  const closeCreateModal = useCallback(() => {
    setCreateModalState({ isOpen: false, defaultValues: null });
  }, []);

  // Edit Modal Handlers
  const openEditModal = useCallback((schedule: ClassSchedule) => {
    setDetailModalState({ isOpen: false, schedule: null }); // Ensure detail is closed if editing
    setEditModalState({ isOpen: true, schedule });
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalState({ isOpen: false, schedule: null });
  }, []);

  // Detail Modal Handlers
  const openDetailModal = useCallback((schedule: ClassSchedule) => {
    setDetailModalState({ isOpen: true, schedule });
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalState({ isOpen: false, schedule: null });
  }, []);

  // Computed: week dates
  const weekDates = useMemo(
    () => getWeekDates(currentDate, config.weekStartsOn),
    [currentDate, config.weekStartsOn],
  );

  // Computed: filtered schedules
  // Note: Basic filtering is done on server, but search/keyword filtering might be client-side
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      // Client-side search filtering
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesClass = schedule.className
          .toLowerCase()
          .includes(searchLower);
        const matchesTeacher = schedule.teacherName
          .toLowerCase()
          .includes(searchLower);
        if (!matchesClass && !matchesTeacher) {
          return false;
        }
      }
      return true;
    });
  }, [schedules, filters.search]);

  // Check if a drop is valid
  const canDropAtSlot = useCallback(
    (
      schedule: ClassSchedule,
      dayOfWeek: number,
      newStartTime: string,
    ): boolean => {
      const duration = calculateDuration(schedule.startTime, schedule.endTime);
      const newStartMinutes = timeToMinutes(newStartTime);
      const newEndTime = minutesToTime(newStartMinutes + duration);

      // Check time bounds
      const maxMinutes = config.endHour * 60;
      if (newStartMinutes + duration > maxMinutes) {
        return false;
      }

      // Check conflicts
      const conflict = checkConflict(
        { dayOfWeek, startTime: newStartTime, endTime: newEndTime },
        schedules,
        schedule.id,
      );

      return !conflict;
    },
    [schedules, config.endHour],
  );

  // Update a schedule (after drag & drop)
  const updateSchedule = useCallback(
    async (id: string, updates: Partial<ClassSchedule>): Promise<boolean> => {
      const schedule = schedules.find((s) => s.id === id);
      if (!schedule) return false;

      // Check for conflicts if day or time is changing
      if (
        updates.dayOfWeek !== undefined ||
        updates.startTime ||
        updates.endTime
      ) {
        const newSchedule = {
          dayOfWeek: updates.dayOfWeek ?? schedule.dayOfWeek,
          startTime: updates.startTime ?? schedule.startTime,
          endTime: updates.endTime ?? schedule.endTime,
        };

        const conflict = checkConflict(newSchedule, schedules, id);
        if (conflict) {
          console.warn("Schedule conflict detected:", conflict);
          return false;
        }
      }

      try {
        await apiUpdateSchedule(id, updates);
        await queryClient.invalidateQueries({ queryKey: schedulerKeys.all });
        return true;
      } catch (error) {
        console.error("Failed to update schedule:", error);
        return false;
      }
    },
    [schedules, queryClient],
  );

  // Delete schedule
  const deleteSchedule = useCallback(
    async (id: string) => {
      try {
        await apiDeleteSchedule(id);
        await queryClient.invalidateQueries({ queryKey: schedulerKeys.all });
        return true;
      } catch (error) {
        console.error("Failed to delete schedule:", error);
        return false;
      }
    },
    [queryClient],
  );

  // Navigate week
  const navigateWeek = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Check conflict (exposed)
  const checkScheduleConflict = useCallback(
    (
      schedule: Pick<ClassSchedule, "dayOfWeek" | "startTime" | "endTime">,
      excludeId?: string,
    ) => {
      return checkConflict(schedule, schedules, excludeId);
    },
    [schedules],
  );

  // ============ DRAG & DROP HANDLERS ============

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, schedule: ClassSchedule) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(schedule));
      e.dataTransfer.effectAllowed = "move";

      // Add dragging class for visual feedback
      if (e.currentTarget) {
        e.currentTarget.style.opacity = "0.5";
      }

      setDragState({
        isDragging: true,
        draggedSchedule: schedule,
        dragOverSlot: null,
        canDrop: false,
      });
    },
    [],
  );

  const handleDragEnd = useCallback((e: DragEvent<HTMLDivElement>) => {
    // Reset opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }

    setDragState({
      isDragging: false,
      draggedSchedule: null,
      dragOverSlot: null,
      canDrop: false,
    });
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, dayOfWeek: number, time: string) => {
      e.preventDefault();

      const { draggedSchedule } = dragState;
      if (!draggedSchedule) return;

      const canDrop = canDropAtSlot(draggedSchedule, dayOfWeek, time);
      e.dataTransfer.dropEffect = canDrop ? "move" : "none";

      setDragState((prev) => ({
        ...prev,
        dragOverSlot: { dayOfWeek, time },
        canDrop,
      }));
    },
    [dragState, canDropAtSlot],
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    // Check if we're leaving to another drop zone
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (!relatedTarget?.hasAttribute("data-drop-zone")) {
      setDragState((prev) => ({
        ...prev,
        dragOverSlot: null,
        canDrop: false,
      }));
    }
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>, dayOfWeek: number, time: string) => {
      e.preventDefault();

      let schedule: ClassSchedule | null = null;

      // Try to get from dataTransfer
      try {
        const data = e.dataTransfer.getData("text/plain");
        if (data) {
          schedule = JSON.parse(data) as ClassSchedule;
        }
      } catch {
        // Fallback to drag state
        schedule = dragState.draggedSchedule;
      }

      if (!schedule) return;

      // Calculate new times
      const duration = calculateDuration(schedule.startTime, schedule.endTime);
      const newStartMinutes = timeToMinutes(time);
      const newEndTime = minutesToTime(newStartMinutes + duration);

      // Update the schedule
      const success = await updateSchedule(schedule.id, {
        dayOfWeek,
        startTime: time,
        endTime: newEndTime,
      });

      if (success) {
        console.log(
          `Moved "${schedule.className}" to day ${dayOfWeek} at ${time}`,
        );
      } else {
        console.warn(
          "Failed to move schedule - conflict detected or API error",
        );
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        draggedSchedule: null,
        dragOverSlot: null,
        canDrop: false,
      });
    },
    [dragState.draggedSchedule, updateSchedule],
  );

  // Context Menu Handlers
  const handleContextMenu = useCallback(
    (e: React.MouseEvent, schedule: ClassSchedule) => {
      e.preventDefault();
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        schedule,
        emptySlot: null,
      });
    },
    [],
  );

  const handleEmptySlotContextMenu = useCallback(
    (e: React.MouseEvent, dayOfWeek: number, time: string) => {
      e.preventDefault();
      // Prevent propagation to avoid double trigger if nested
      e.stopPropagation();
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        schedule: null,
        emptySlot: { dayOfWeek, time },
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value: SchedulerContextType = {
    schedules,
    teachers,
    classes,
    currentDate,
    currentView,
    weekDates,
    filters,
    filteredSchedules,
    config,
    dragState,
    contextMenu,
    createModalState,
    editModalState,
    openEditModal,
    closeEditModal,
    detailModalState,
    openDetailModal,
    closeDetailModal,
    setCurrentDate,
    setCurrentView,
    setFilters,
    updateSchedule,
    deleteSchedule,
    openCreateModal,
    closeCreateModal,
    navigateWeek,
    goToToday,
    checkScheduleConflict,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleContextMenu,
    handleEmptySlotContextMenu,
    closeContextMenu,
    readOnly,
  };

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
}

export function useScheduler() {
  const context = useContext(SchedulerContext);
  if (!context) {
    throw new Error("useScheduler must be used within a SchedulerProvider");
  }
  return context;
}
