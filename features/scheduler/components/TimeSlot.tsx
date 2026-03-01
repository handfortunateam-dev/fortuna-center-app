import React from "react";
import { useScheduler } from "../context/SchedulerContext";
import { SLOT_HEIGHT } from "../constants";

interface TimeSlotProps {
  dayOfWeek: number;
  hour: number;
  minute: number;
  isHourStart: boolean;
}

import { Icon } from "@iconify/react";

export function TimeSlot({
  dayOfWeek,
  hour,
  minute,
  isHourStart,
}: TimeSlotProps) {
  const {
    handleDragOver,
    handleDragLeave,
    handleDrop,
    readOnly,
    handleEmptySlotContextMenu,
    dragState,
  } = useScheduler();

  const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  const isDragOver =
    dragState.dragOverSlot?.dayOfWeek === dayOfWeek &&
    dragState.dragOverSlot?.time === slotTime;
  const canDrop = isDragOver && dragState.canDrop;

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    handleDragOver(e, dayOfWeek, slotTime);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    handleDrop(e, dayOfWeek, slotTime);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    handleEmptySlotContextMenu(e, dayOfWeek, slotTime);
  };

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
        relative flex items-center justify-center transition-colors
        ${isHourStart ? "border-t border-gray-200 dark:border-gray-700" : "border-t border-gray-100 dark:border-gray-800"}
        ${canDrop ? "bg-success-50 dark:bg-success-900/20 border-l-2 border-l-success z-10" : ""}
      `}
      style={{ height: `${SLOT_HEIGHT}px` }}
    >
      {canDrop && (
        <div className="absolute left-1 top-0 bottom-0 flex items-center">
          <Icon
            icon="lucide:check-circle-2"
            className="text-success w-4 h-4 ml-1"
          />
        </div>
      )}
    </div>
  );
}
