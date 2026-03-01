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
