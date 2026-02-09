"use client";

import React from "react";
import { ClassSchedule } from "../types";
import { TimeSlot } from "./TimeSlot";
import { ClassCard } from "./ClassCard";
import { useScheduler } from "../context/SchedulerContext";
import { generateTimeSlots, isToday, isWeekend, formatDate } from "../utils/timeUtils";
import { DAYS_OF_WEEK } from "../constants";

interface DayColumnProps {
  date: Date;
  schedules: ClassSchedule[];
  onScheduleClick?: (schedule: ClassSchedule) => void;
}

export function DayColumn({ date, schedules, onScheduleClick }: DayColumnProps) {
  const { config } = useScheduler();
  const dayOfWeek = date.getDay();
  const dayInfo = DAYS_OF_WEEK[dayOfWeek];
  const timeSlots = generateTimeSlots(config);

  const today = isToday(date);
  const weekend = isWeekend(date);

  return (
    <div className="flex-1 min-w-[100px]">
      {/* Day Header - fixed height 68px to match TimeColumn */}
      <div
        className={`
          sticky top-0 z-20 text-center py-2 border-b h-[68px]
          flex flex-col justify-center
          ${today
            ? "bg-primary/10 border-primary"
            : weekend
              ? "bg-red-50 dark:bg-red-900/20 border-gray-200 dark:border-gray-700"
              : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          }
        `}
      >
        <p
          className={`
            text-xs font-medium uppercase tracking-wide
            ${today ? "text-primary" : weekend ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}
          `}
        >
          {dayInfo.short}
        </p>
        <p
          className={`
            text-xl font-bold
            ${today ? "text-primary" : weekend ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}
          `}
        >
          {formatDate(date, "day-only")}
        </p>
        {today && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
        )}
      </div>

      {/* Time Slots Container */}
      <div
        className={`
          relative pt-2
          ${weekend ? "bg-red-50/30 dark:bg-red-900/10" : ""}
        `}
      >
        {/* Time slot grid */}
        {timeSlots.slice(0, -1).map((time) => {
          const [hour, minute] = time.split(":").map(Number);
          return (
            <TimeSlot
              key={time}
              dayOfWeek={dayOfWeek}
              hour={hour}
              minute={minute}
              isHourStart={minute === 0}
            />
          );
        })}

        {/* Class cards overlay */}
        {schedules.map((schedule) => (
          <ClassCard
            key={schedule.id}
            schedule={schedule}
            onClick={onScheduleClick}
          />
        ))}
      </div>
    </div>
  );
}
