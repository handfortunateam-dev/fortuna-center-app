"use client";

import React, { DragEvent } from "react";
import { Icon } from "@iconify/react";
import { ClassSchedule } from "../types";
import {
  calculateTopPosition,
  calculateCardHeight,
  formatDuration,
} from "../utils/timeUtils";
import { useScheduler } from "../context/SchedulerContext";

import { Avatar, AvatarGroup, Tooltip } from "@heroui/react";

interface ClassCardProps {
  schedule: ClassSchedule;
  onClick?: (schedule: ClassSchedule) => void;
}

export function ClassCard({ schedule, onClick }: ClassCardProps) {
  const {
    config,
    dragState,
    handleDragStart,
    handleDragEnd,
    handleContextMenu,
    readOnly,
  } = useScheduler();

  const topPosition = calculateTopPosition(schedule.startTime, config);
  const cardHeight = calculateCardHeight(
    schedule.startTime,
    schedule.endTime,
    config,
  );

  // Check if this card is being dragged
  const isDragging = dragState.draggedSchedule?.id === schedule.id;

  // Primary style from the first teacher or default
  const primaryColor = schedule.teacherColor || "#3b82f6";
  const bgColor = primaryColor + "20"; // 20% opacity
  const borderColor = primaryColor;

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we just finished dragging
    if (dragState.isDragging) return;
    e.stopPropagation();
    onClick?.(schedule);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    if (readOnly) return;
    handleContextMenu(e, schedule);
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (readOnly) return;
    handleDragStart(e, schedule);
  };

  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    handleDragEnd(e);
  };

  const teachers = schedule.teachers || [
    {
      id: schedule.teacherId,
      name: schedule.teacherName,
      color: schedule.teacherColor,
    },
  ];

  return (
    <div
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      className={`
        absolute left-1 right-1 rounded-lg ${readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        transition-all duration-200 overflow-hidden select-none border-l-4
        ${!readOnly ? "hover:shadow-md hover:scale-[1.02] hover:z-10" : ""}
        ${isDragging ? "opacity-50 shadow-lg scale-105 z-50 ring-2 ring-primary" : "opacity-100"}
      `}
      style={{
        top: `${topPosition}px`,
        height: `${cardHeight}px`,
        backgroundColor: bgColor,
        borderColor: borderColor,
        minHeight: "60px",
      }}
    >
      <div className="p-2 h-full flex flex-col relative">
        {/* Class Name */}
        <h4
          className="font-bold text-sm truncate pr-4"
          style={{ color: borderColor }}
        >
          {schedule.className}
        </h4>

        {/* Teachers Avatars */}
        <div className="mt-1 flex items-center justify-between">
          <AvatarGroup isBordered max={3} size="sm" className="justify-start">
            {teachers.map((t) => (
              <Tooltip key={t.id} content={t.name} placement="top">
                <Avatar
                  src={t.avatar}
                  name={t.name.charAt(0)}
                  size="sm"
                  className="w-6 h-6 text-[10px]"
                  style={{
                    border: `2px solid ${t.color}`,
                    backgroundColor: t.color + "40",
                  }}
                />
              </Tooltip>
            ))}
          </AvatarGroup>
        </div>

        {/* Time and Stats Row */}
        <div className="mt-auto flex flex-col gap-0.5">
          <p className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400">
            {schedule.startTime} - {schedule.endTime}
          </p>

          {cardHeight >= 90 && (
            <div className="flex items-center gap-2 opacity-70">
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon icon="lucide:users" className="w-3 h-3" />
                <span>{schedule.enrolledStudents}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Icon icon="lucide:clock" className="w-3 h-3" />
                <span>
                  {formatDuration(schedule.startTime, schedule.endTime)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag handle indicator (visible on hover) */}
      {!readOnly && (
        <div className="absolute top-1 right-1 opacity-20 hover:opacity-100 transition-opacity">
          <Icon icon="lucide:grip-vertical" className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </div>
  );
}
