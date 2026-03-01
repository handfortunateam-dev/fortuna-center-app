// Scheduler Types & Interfaces

export interface Teacher {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code?: string;
  level: string;
  maxStudents: number;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  className: string;

  // Multiple teachers support
  teachers: {
    id: string;
    name: string;
    color: string;
    avatar?: string;
  }[];

  // Computed from first teacher (for backward compat in display)
  teacherId: string;
  teacherName: string;
  teacherColor: string;

  // Time
  startTime: string; // "15:00"
  endTime: string; // "16:30"
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Meta
  hasAttendance: boolean;
  enrolledStudents: number;
  location?: string;
  notes?: string;
}

export interface TimeSlot {
  day: Date;
  dayOfWeek: number;
  hour: number;
  minute: number;
}

export interface DragItem {
  type: "CLASS_CARD";
  schedule: ClassSchedule;
  sourceSlot: TimeSlot;
}

export type SchedulerView = "day" | "week" | "month";

export interface SchedulerFilters {
  teacherId?: string;
  classId?: string;
  dayOfWeek?: number;
  search?: string;
}

export interface SchedulerConfig {
  startHour: number; // e.g., 7 (07:00)
  endHour: number; // e.g., 20 (20:00)
  slotDuration: number; // in minutes, e.g., 30
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  startHour: 7,
  endHour: 20,
  slotDuration: 30,
  weekStartsOn: 1, // Monday
};

// For drag and drop
export const ITEM_TYPES = {
  CLASS_CARD: "CLASS_CARD",
} as const;

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  schedule: ClassSchedule | null;
  emptySlot?: { dayOfWeek: number; time: string } | null;
}
