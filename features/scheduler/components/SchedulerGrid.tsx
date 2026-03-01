"use client";

import React from "react";
import { DayColumn } from "./DayColumn";
import { TimeColumn } from "./TimeColumn";
import { MonthView } from "./MonthView";
import { useScheduler } from "../context/SchedulerContext";
import { getSchedulesForDay, sortSchedulesByTime } from "../utils/timeUtils";
import { ClassSchedule } from "../types";

interface SchedulerGridProps {
  onScheduleClick?: (schedule: ClassSchedule) => void;
}

export function SchedulerGrid({ onScheduleClick }: SchedulerGridProps) {
  const {
    weekDates,
    filteredSchedules,
    currentView,
    currentDate,
    setExpandedScheduleId,
  } = useScheduler();

  // Month view has its own component
  if (currentView === "month") {
    return <MonthView onScheduleClick={onScheduleClick} />;
  }

  // For day view, only show the current day
  const daysToShow = currentView === "day" ? [currentDate] : weekDates;

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
      onClick={() => setExpandedScheduleId(null)}
    >
      <div className="flex overflow-x-auto">
        {/* Time column */}
        <TimeColumn />

        {/* Day columns */}
        <div className="flex flex-1 divide-x divide-gray-200 dark:divide-gray-700">
          {daysToShow.map((date) => {
            const dayOfWeek = date.getDay();
            const daySchedules = sortSchedulesByTime(
              getSchedulesForDay(filteredSchedules, dayOfWeek),
            );

            return (
              <DayColumn
                key={date.toISOString()}
                date={date}
                schedules={daySchedules}
                onScheduleClick={onScheduleClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
