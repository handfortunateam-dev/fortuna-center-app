"use client";

import React, { useRef, useEffect } from "react";
import { Card, Listbox, ListboxItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useScheduler } from "../context/SchedulerContext";
import { DAYS_OF_WEEK } from "../constants";

export function SchedulerContextMenu() {
  const {
    contextMenu,
    closeContextMenu,
    deleteSchedule,
    openCreateModal,
    openEditModal,
    openDetailModal,
  } = useScheduler();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen) return null;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      if (contextMenu.schedule) {
        await deleteSchedule(contextMenu.schedule.id);
      }
    }
    closeContextMenu();
  };

  const handleEdit = () => {
    if (contextMenu.schedule) {
      openEditModal(contextMenu.schedule);
    }
    closeContextMenu();
  };

  const handleViewDetails = () => {
    if (contextMenu.schedule) {
      openDetailModal(contextMenu.schedule);
    }
    closeContextMenu();
  };

  const handleAddTeacher = () => {
    if (contextMenu.schedule) {
      const existingTeacherIds = contextMenu.schedule.teachers.map((t) => t.id);
      openCreateModal({
        classId: contextMenu.schedule.classId,
        dayOfWeek: contextMenu.schedule.dayOfWeek,
        startTime: contextMenu.schedule.startTime,
        endTime: contextMenu.schedule.endTime,
        location: contextMenu.schedule.location,
        notes: contextMenu.schedule.notes,
        existingTeacherIds,
      });
    }
    closeContextMenu();
  };

  const handleAddSchedule = () => {
    if (contextMenu.emptySlot) {
      openCreateModal({
        dayOfWeek: contextMenu.emptySlot.dayOfWeek,
        startTime: contextMenu.emptySlot.time,
      });
    }
    closeContextMenu();
  };

  // Determine which menu to show
  const showScheduleMenu = !!contextMenu.schedule;
  const showEmptySlotMenu = !!contextMenu.emptySlot;

  if (!showScheduleMenu && !showEmptySlotMenu) return null;

  const items = [];
  if (showScheduleMenu) {
    const dayName =
      DAYS_OF_WEEK.find((d) => d.value === contextMenu.schedule?.dayOfWeek)
        ?.label || "this day";
    items.push(
      {
        key: "add-teacher",
        label: `Add teachers on ${dayName}`,
        icon: "lucide:user-plus",
        color: "primary",
        textColor: "text-primary",
      },
      {
        key: "view",
        label: "View Details",
        icon: "lucide:eye",
        color: "default",
        textColor: "default",
      },
      {
        key: "edit",
        label: "Edit Schedule",
        icon: "lucide:pencil",
        color: "default",
        textColor: "default",
      },
      {
        key: "delete",
        label: "Delete",
        icon: "lucide:trash-2",
        color: "danger",
        textColor: "text-danger",
      },
    );
  }
  if (showEmptySlotMenu) {
    items.push({
      key: "add",
      label: "Add Schedule",
      icon: "lucide:plus",
      color: "default",
      textColor: "default",
    });
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px]"
      style={{
        top: Math.min(contextMenu.y, window.innerHeight - 250), // Prevent overflow bottom
        left: Math.min(contextMenu.x, window.innerWidth - 200), // Prevent overflow right
      }}
    >
      <Card className="shadow-xl border border-gray-100 dark:border-gray-700">
        <Listbox
          aria-label="Schedule Actions"
          variant="flat"
          items={items}
          onAction={(key) => {
            if (key === "add-teacher") handleAddTeacher();
            if (key === "view") handleViewDetails();
            if (key === "edit") handleEdit();
            if (key === "delete") handleDelete();
            if (key === "add") handleAddSchedule();
          }}
        >
          {(item) => (
            <ListboxItem
              key={item.key}
              color={item.color as any}
              className={
                item.textColor === "text-danger"
                  ? "text-danger"
                  : item.textColor === "text-primary"
                    ? "text-primary font-bold"
                    : ""
              }
              startContent={
                <Icon
                  icon={item.icon}
                  className={`w-4 h-4 ${item.textColor === "text-danger" ? "text-danger" : item.textColor === "text-primary" ? "text-primary" : "text-gray-500"}`}
                />
              }
            >
              {item.label}
            </ListboxItem>
          )}
        </Listbox>
      </Card>
    </div>
  );
}
