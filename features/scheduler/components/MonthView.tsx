"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { useScheduler } from "../context/SchedulerContext";
import { ClassSchedule } from "../types";
import { isToday, isSameDay } from "../utils/timeUtils";
import { DAYS_OF_WEEK } from "../constants";

interface MonthViewProps {
  onScheduleClick?: (schedule: ClassSchedule) => void;
}

export function MonthView({ onScheduleClick }: MonthViewProps) {
  const { currentDate, filteredSchedules, config } = useScheduler();

  // Get all days for the current month grid
  const monthDays = getMonthDays(currentDate, config.weekStartsOn);

  // Group schedules by day of week
  const getSchedulesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return filteredSchedules.filter((s) => s.dayOfWeek === dayOfWeek);
  };

  const currentMonth = currentDate.getMonth();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {DAYS_OF_WEEK.slice(config.weekStartsOn)
          .concat(DAYS_OF_WEEK.slice(0, config.weekStartsOn))
          .map((day) => (
            <div
              key={day.value}
              className={`
                py-3 text-center text-sm font-medium
                ${day.value === 0 || day.value === 6
                  ? "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50"
                  : "text-gray-600 dark:text-gray-400"
                }
              `}
            >
              {day.short}
            </div>
          ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentMonth;
          const today = isToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const daySchedules = getSchedulesForDate(date);

          return (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border-b border-r border-gray-100 dark:border-gray-800
                ${!isCurrentMonth ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}
                ${isWeekend && isCurrentMonth ? "bg-red-50/30 dark:bg-red-900/10" : ""}
              `}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`
                    inline-flex items-center justify-center w-7 h-7 text-sm rounded-full
                    ${today
                      ? "bg-primary text-white font-bold"
                      : isCurrentMonth
                        ? "text-gray-900 dark:text-gray-100 font-medium"
                        : "text-gray-400 dark:text-gray-600"
                    }
                  `}
                >
                  {date.getDate()}
                </span>
                {daySchedules.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{daySchedules.length - 3}
                  </span>
                )}
              </div>

              {/* Schedule items (max 3 visible) */}
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => onScheduleClick?.(schedule)}
                    className={`
                      px-2 py-1 rounded text-xs cursor-pointer truncate
                      hover:opacity-80 transition-opacity
                      ${!isCurrentMonth ? "opacity-50" : ""}
                    `}
                    style={{
                      backgroundColor: schedule.teacherColor + "20",
                      borderLeft: `3px solid ${schedule.teacherColor}`,
                      color: schedule.teacherColor,
                    }}
                    title={`${schedule.className} - ${schedule.teacherName} (${schedule.startTime}-${schedule.endTime})`}
                  >
                    <div className="font-medium truncate">{schedule.className}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-[10px]">
                      {schedule.startTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get all days for month view (including days from prev/next month)
function getMonthDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Calculate start date (may be from previous month)
  const startDay = firstDayOfMonth.getDay();
  const diff = startDay - weekStartsOn;
  const daysFromPrevMonth = diff < 0 ? diff + 7 : diff;

  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - daysFromPrevMonth);

  // Generate 6 weeks (42 days) to fill the grid
  const days: Date[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}
