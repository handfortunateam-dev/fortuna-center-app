"use client";

import React, { DragEvent } from "react";
import { Icon } from "@iconify/react";
import { ClassSchedule } from "../types";
import { calculateTopPosition, calculateCardHeight } from "../utils/timeUtils";
import { useScheduler } from "../context/SchedulerContext";

import { Avatar, AvatarGroup, Tooltip } from "@heroui/react";

interface ClassCardProps {
  schedule: ClassSchedule;
  onClick?: (schedule: ClassSchedule) => void;
  left?: number;
  width?: number;
  isPreview?: boolean;
}

export function ClassCard({
  schedule,
  onClick,
  left = 0,
  width = 100,
  isPreview = false,
}: ClassCardProps) {
  const {
    config,
    dragState,
    handleDragStart,
    handleDragEnd,
    handleContextMenu,
    readOnly,
    expandedScheduleId,
    setExpandedScheduleId,
  } = useScheduler();

  const topPosition = calculateTopPosition(schedule.startTime, config);
  const cardHeight = calculateCardHeight(
    schedule.startTime,
    schedule.endTime,
    config,
  );

  // Check if this card is being dragged
  const isDragging =
    !isPreview && dragState.draggedSchedule?.id === schedule.id;

  // Primary style from the first teacher or default
  const primaryColor = isPreview
    ? "#3b82f6"
    : schedule.teacherColor || "#3b82f6";
  const bgColor = isPreview ? "#3b82f630" : primaryColor + "20"; // 20% opacity
  const borderCol = isPreview ? "#3b82f6" : primaryColor;

  const isExpanded = !isPreview && expandedScheduleId === schedule.id;

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger click if we just finished dragging
    if (dragState.isDragging) return;
    e.stopPropagation();

    if (!isExpanded && !isPreview) {
      setExpandedScheduleId(schedule.id);
    } else {
      onClick?.(schedule);
    }
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

  const finalWidth = isExpanded ? Math.max(100, width + 10) : width;
  const finalLeft = isExpanded ? Math.max(0, left - 5) : left;

  return (
    <div
      draggable={!readOnly && !isPreview}
      onDragStart={!isPreview ? onDragStart : undefined}
      onDragEnd={!isPreview ? onDragEnd : undefined}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      className={`
        absolute rounded-md border-l-4 group
        ${readOnly || isPreview ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
        ${isPreview ? "opacity-60 z-30 border-dashed ring-2 ring-primary/50 pointer-events-none blur-[0.5px]" : "transition-all duration-200"}
        ${!isPreview && !readOnly && !isExpanded ? "hover:shadow-xl hover:z-40 hover:scale-[1.02]" : ""}
        ${isDragging ? "opacity-30 shadow-none z-50 ring-2 ring-primary" : isExpanded ? "z-[60] shadow-2xl ring-2 ring-primary/60" : !isPreview ? "z-10" : ""}
        ${dragState.isDragging && !isDragging && !isPreview ? "pointer-events-none" : ""}
        ${isExpanded ? "overflow-visible" : "overflow-hidden"}
      `}
      style={{
        top: `${topPosition}px`,
        height: isExpanded ? "auto" : `${cardHeight}px`,
        left: `${finalLeft}%`,
        width: `${finalWidth}%`,
        backgroundColor: bgColor,
        borderColor: borderCol,
        minHeight: isExpanded ? `${Math.max(cardHeight, 60)}px` : "40px",
        padding: width < 50 && !isExpanded ? "4px" : "8px",
      }}
    >
      <div className="h-full flex flex-col relative w-full">
        {/* Class Name */}
        <h4
          className={`font-bold ${!isExpanded ? "truncate pr-4" : "pr-6 mb-1 whitespace-normal"} ${!isExpanded && width < 30 ? "text-[10px]" : "text-xs"} ${isExpanded ? "text-sm" : ""}`}
          style={{ color: borderCol }}
        >
          {schedule.className}
        </h4>

        {/* Teachers Avatars - hide if too narrow unless expanded */}
        {(width > 25 || isExpanded) && (
          <div className="mt-1 flex items-center justify-between">
            <AvatarGroup
              isBordered
              max={2}
              size="sm"
              className="justify-start scale-75 origin-left"
            >
              {teachers.map((t) => (
                <Tooltip key={t.id} content={t.name} placement="top">
                  <Avatar
                    src={t.avatar}
                    name={t.name.charAt(0)}
                    size="sm"
                    className="w-5 h-5 text-[8px]"
                    style={{
                      border: `1px solid ${t.color}`,
                      backgroundColor: t.color + "40",
                    }}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          </div>
        )}

        {/* Time - adaptable size */}
        <div className={`flex flex-col ${isExpanded ? "mt-4" : "mt-auto"}`}>
          <p
            className={`font-medium text-gray-600 dark:text-gray-400 leading-tight ${!isExpanded && width < 30 ? "text-[8px]" : "text-[10px]"} ${isExpanded ? "text-xs" : ""}`}
          >
            {schedule.startTime} - {schedule.endTime}
          </p>

          {((cardHeight >= 70 && width > 40) || isExpanded) && (
            <div
              className={`flex items-center gap-1.5 opacity-60 mt-0.5 ${isExpanded ? "mt-2" : ""}`}
            >
              <div
                className={`flex items-center gap-0.5 text-gray-500 ${isExpanded ? "text-xs" : "text-[9px]"}`}
              >
                <Icon
                  icon="lucide:users"
                  className={`${isExpanded ? "w-3.5 h-3.5" : "w-2.5 h-2.5"}`}
                />
                <span>{schedule.enrolledStudents} students</span>
              </div>
            </div>
          )}
        </div>

        {/* View Details Button explicit hint when expanded */}
        {isExpanded && !readOnly && (
          <div className="mt-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-[10px] text-primary font-medium flex items-center justify-center gap-1 cursor-pointer hover:underline">
              <Icon icon="lucide:external-link" className="w-3 h-3" />
              Click full card to view details
            </div>
          </div>
        )}
      </div>

      {/* Drag handle indicator */}
      {!readOnly && width > 40 && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon icon="lucide:grip-vertical" className="w-3 h-3 text-gray-400" />
        </div>
      )}
    </div>
  );
}
