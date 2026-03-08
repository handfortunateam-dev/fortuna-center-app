"use client";

import React from "react";
import { SchedulerProvider } from "../context/SchedulerContext";
import { SchedulerHeader } from "./SchedulerHeader";
import { SchedulerGrid } from "./SchedulerGrid";
import { ClassSchedule } from "../types";
import { useScheduler } from "../context/SchedulerContext";
import { CreateScheduleModal } from "./CreateScheduleModal";
import { EditScheduleModal } from "./EditScheduleModal";
import { SchedulerContextMenu } from "./SchedulerContextMenu";
import { ScheduleDetailModal } from "./ScheduleDetailModal";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { Icon } from "@iconify/react";
import { ScrollNavigator } from "./ScrollNavigator";

interface SchedulerProps {
  onScheduleClick?: (schedule: ClassSchedule) => void;
  readOnly?: boolean;
  initialFilters?: Record<string, unknown>;
  hideTeacherFilter?: boolean;
}

function SchedulerContent({
  onScheduleClick,
  hideTeacherFilter,
}: SchedulerProps) {
  const {
    createModalState,
    closeCreateModal,
    editModalState,
    closeEditModal,
    detailModalState,
    closeDetailModal,
    openDetailModal,
    readOnly,
    isUpdating,
    isWideMode,
    setIsWideMode,
    weekDates,
    currentView,
    currentDate,
  } = useScheduler();

  const handleScheduleClick = (schedule: ClassSchedule) => {
    if (onScheduleClick) {
      onScheduleClick(schedule);
    } else {
      openDetailModal(schedule);
    }
  };

  return (
    <div className="space-y-4">
      <LoadingScreen isLoading={isUpdating} />
      <SchedulerHeader hideTeacherFilter={hideTeacherFilter} />
      <SchedulerGrid onScheduleClick={handleScheduleClick} />

      {/* Detail Modal for pure view or readOnly */}
      <ScheduleDetailModal
        schedule={detailModalState.schedule}
        onClose={closeDetailModal}
      />

      {!readOnly && (
        <>
          <SchedulerContextMenu />
          <CreateScheduleModal
            isOpen={createModalState.isOpen}
            onClose={closeCreateModal}
            defaultValues={createModalState.defaultValues}
          />
          <EditScheduleModal
            isOpen={editModalState.isOpen}
            onClose={closeEditModal}
            schedule={editModalState.schedule}
          />
        </>
      )}

      {/* Truly Floating Wide Mode Toggle */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWideMode(!isWideMode);
          }}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.2)] transition-all active:scale-90 hover:scale-105
            ${
              isWideMode
                ? "bg-primary text-white hover:bg-primary-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-primary/20"
            }
          `}
          title={isWideMode ? "Fit to Screen" : "Switch to Wide Mode"}
        >
          <Icon
            icon={isWideMode ? "lucide:minimize-2" : "lucide:maximize-2"}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Truly Floating Scroll Navigator */}
      {currentView !== "month" && (
        <ScrollNavigator
          days={currentView === "day" ? [currentDate] : weekDates}
        />
      )}
    </div>
  );
}

export function Scheduler({
  onScheduleClick,
  readOnly = false,
  initialFilters = {},
  hideTeacherFilter = false,
}: SchedulerProps) {
  return (
    <SchedulerProvider readOnly={readOnly} initialFilters={initialFilters}>
      <SchedulerContent
        onScheduleClick={onScheduleClick}
        hideTeacherFilter={hideTeacherFilter}
      />
    </SchedulerProvider>
  );
}
