// Time utility functions for scheduler

import { ClassSchedule, SchedulerConfig, TimeSlot } from "../types";
import { DEFAULT_CONFIG, SLOT_HEIGHT } from "../constants";

/**
 * Parse time string to hours and minutes
 * @param time - Time string in "HH:mm" format
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Format hours and minutes to time string
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 */
export function formatTime(hours: number, minutes: number): string {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Convert time string to minutes from midnight
 * @param time - Time string in "HH:mm" format
 */
export function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string
 * @param totalMinutes - Minutes from midnight
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return formatTime(hours, minutes);
}

/**
 * Calculate duration in minutes between two times
 * @param startTime - Start time in "HH:mm" format
 * @param endTime - End time in "HH:mm" format
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Calculate the top position for a schedule card based on start time
 * @param startTime - Start time in "HH:mm" format
 * @param config - Scheduler configuration
 */
export function calculateTopPosition(
  startTime: string,
  config: SchedulerConfig = DEFAULT_CONFIG
): number {
  const { hours, minutes } = parseTime(startTime);
  const startMinutes = (hours - config.startHour) * 60 + minutes;
  return (startMinutes / config.slotDuration) * SLOT_HEIGHT;
}

/**
 * Calculate the height for a schedule card based on duration
 * @param startTime - Start time in "HH:mm" format
 * @param endTime - End time in "HH:mm" format
 * @param config - Scheduler configuration
 */
export function calculateCardHeight(
  startTime: string,
  endTime: string,
  config: SchedulerConfig = DEFAULT_CONFIG
): number {
  const duration = calculateDuration(startTime, endTime);
  return (duration / config.slotDuration) * SLOT_HEIGHT;
}

/**
 * Generate time slots for the scheduler grid
 * @param config - Scheduler configuration
 */
export function generateTimeSlots(
  config: SchedulerConfig = DEFAULT_CONFIG
): string[] {
  const slots: string[] = [];
  const totalSlots =
    ((config.endHour - config.startHour) * 60) / config.slotDuration;

  for (let i = 0; i <= totalSlots; i++) {
    const minutes = config.startHour * 60 + i * config.slotDuration;
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

/**
 * Get the week dates starting from a given date
 * @param date - Reference date
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 */
export function getWeekDates(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const result: Date[] = [];
  const current = new Date(date);
  const day = current.getDay();

  // Calculate the start of the week
  const diff = day - weekStartsOn;
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - (diff < 0 ? diff + 7 : diff));

  // Generate 7 days
  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(startOfWeek);
    weekDay.setDate(startOfWeek.getDate() + i);
    result.push(weekDay);
  }

  return result;
}

/**
 * Format date for display
 * @param date - Date to format
 * @param format - Format type
 */
export function formatDate(
  date: Date,
  format: "short" | "long" | "day-only" = "short"
): string {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: "short", day: "numeric" },
    long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
    "day-only": { day: "numeric" },
  }[format];

  return date.toLocaleDateString("en-US", options);
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 * @param date - Date to check
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if a date is weekend
 * @param date - Date to check
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Get the time slot from a y-position in the grid
 * @param yPosition - Y position in pixels
 * @param config - Scheduler configuration
 */
export function getTimeFromPosition(
  yPosition: number,
  config: SchedulerConfig = DEFAULT_CONFIG
): string {
  const slotIndex = Math.floor(yPosition / SLOT_HEIGHT);
  const totalMinutes =
    config.startHour * 60 + slotIndex * config.slotDuration;
  return minutesToTime(totalMinutes);
}

/**
 * Check if a new schedule conflicts with existing schedules
 * @param newSchedule - The schedule to check
 * @param existingSchedules - List of existing schedules
 * @param excludeId - Optional ID to exclude (for editing)
 */
export function checkConflict(
  newSchedule: Pick<ClassSchedule, "dayOfWeek" | "startTime" | "endTime">,
  existingSchedules: ClassSchedule[],
  excludeId?: string
): ClassSchedule | null {
  const newStart = timeToMinutes(newSchedule.startTime);
  const newEnd = timeToMinutes(newSchedule.endTime);

  for (const existing of existingSchedules) {
    if (excludeId && existing.id === excludeId) continue;
    if (existing.dayOfWeek !== newSchedule.dayOfWeek) continue;

    const existingStart = timeToMinutes(existing.startTime);
    const existingEnd = timeToMinutes(existing.endTime);

    // Check for overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      return existing;
    }
  }

  return null;
}

/**
 * Calculate new time after dragging
 * @param originalTime - Original time string
 * @param deltaY - Pixel change in Y direction
 * @param config - Scheduler configuration
 */
export function calculateNewTime(
  originalTime: string,
  deltaY: number,
  config: SchedulerConfig = DEFAULT_CONFIG
): string {
  const slotsDelta = Math.round(deltaY / SLOT_HEIGHT);
  const originalMinutes = timeToMinutes(originalTime);
  const newMinutes = originalMinutes + slotsDelta * config.slotDuration;

  // Clamp to valid range
  const minMinutes = config.startHour * 60;
  const maxMinutes = config.endHour * 60;
  const clampedMinutes = Math.max(minMinutes, Math.min(maxMinutes, newMinutes));

  return minutesToTime(clampedMinutes);
}

/**
 * Get schedules for a specific day
 * @param schedules - All schedules
 * @param dayOfWeek - Day of week (0-6)
 */
export function getSchedulesForDay(
  schedules: ClassSchedule[],
  dayOfWeek: number
): ClassSchedule[] {
  return schedules.filter((s) => s.dayOfWeek === dayOfWeek);
}

/**
 * Sort schedules by start time
 * @param schedules - Schedules to sort
 */
export function sortSchedulesByTime(
  schedules: ClassSchedule[]
): ClassSchedule[] {
  return [...schedules].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });
}

/**
 * Format duration for display (e.g., "1h 30m")
 * @param startTime - Start time
 * @param endTime - End time
 */
export function formatDuration(startTime: string, endTime: string): string {
  const minutes = calculateDuration(startTime, endTime);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
