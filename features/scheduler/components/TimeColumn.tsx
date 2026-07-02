"use client";

import React from "react";
import { useScheduler } from "../context/SchedulerContext";
import { generateTimeSlots } from "../utils/timeUtils";
import { SLOT_HEIGHT } from "../constants";

export function TimeColumn() {
  const { config } = useScheduler();
  const timeSlots = generateTimeSlots(config);

  return (
    <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
      {/* Empty header space to align with day headers (matching DayColumn header height) */}
      <div className="sticky top-0 z-20 h-[68px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" />

      {/* Time labels */}
      <div className="relative pt-2">
        {timeSlots.map((time, index) => {
          const isHourStart = time.endsWith(":00");

          // Skip the last slot (no need to show label at the end)
          if (index === timeSlots.length - 1) return null;

          return (
            <div
              key={time}
              className="relative"
              style={{ height: `${SLOT_HEIGHT}px` }}
            >
              {isHourStart && (
                <span
                  className="
                    absolute top-0 right-2 left-1
                    text-xs font-medium text-gray-500 dark:text-gray-400
                    bg-white dark:bg-gray-900
                  "
                >
                  {time}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
