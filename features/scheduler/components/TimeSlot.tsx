"use client";

import React, { DragEvent } from "react";
import { useScheduler } from "../context/SchedulerContext";
import { SLOT_HEIGHT } from "../constants";

interface TimeSlotProps {
  dayOfWeek: number;
  hour: number;
  minute: number;
  isHourStart: boolean;
}

export function TimeSlot({
  dayOfWeek,
  hour,
  minute,
  isHourStart,
}: TimeSlotProps) {
  const { dragState, handleDragOver, handleDragLeave, handleDrop, readOnly } =
    useScheduler();

  const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  // Check if this slot is being hovered during drag
  const isHovering =
    dragState.dragOverSlot?.dayOfWeek === dayOfWeek &&
    dragState.dragOverSlot?.time === slotTime;

  const canDrop = isHovering && dragState.canDrop;
  const cannotDrop = isHovering && !dragState.canDrop;

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    handleDragOver(e, dayOfWeek, slotTime);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    handleDrop(e, dayOfWeek, slotTime);
  };

  const { handleEmptySlotContextMenu } = useScheduler();

  const onContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    handleEmptySlotContextMenu(e, dayOfWeek, slotTime);
  };

  // Determine background color based on drag state
  let bgClass = "";
  if (canDrop) {
    bgClass = "bg-green-100 dark:bg-green-900/30";
  } else if (cannotDrop) {
    bgClass = "bg-red-100 dark:bg-red-900/30";
  } else if (dragState.isDragging) {
    bgClass = "bg-blue-50/50 dark:bg-blue-900/10";
  }

  return (
    <div
      data-drop-zone
      data-time={slotTime}
      data-day={dayOfWeek}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onContextMenu={onContextMenu}
      className={`
        relative
        ${isHourStart ? "border-t border-gray-200 dark:border-gray-700" : "border-t border-gray-100 dark:border-gray-800"}
        ${bgClass}
        transition-colors duration-150
      `}
      style={{ height: `${SLOT_HEIGHT}px` }}
    >
      {/* Drop indicator line */}
      {isHovering && (
        <div
          className={`
            absolute inset-x-1 top-0 h-1 rounded-full
            ${canDrop ? "bg-green-500" : "bg-red-500"}
          `}
        />
      )}

      {/* Drop feedback icon */}
      {isHovering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {canDrop ? (
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
