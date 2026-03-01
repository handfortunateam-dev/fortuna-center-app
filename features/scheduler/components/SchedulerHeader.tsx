"use client";

import React, { useState } from "react";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Input,
  Tabs,
  Tab,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useScheduler } from "../context/SchedulerContext";
import { SchedulerView } from "../types";
import { formatDate } from "../utils/timeUtils";

export function SchedulerHeader({
  hideTeacherFilter = false,
}: {
  hideTeacherFilter?: boolean;
}) {
  const {
    currentDate,
    currentView,
    weekDates,
    filters,
    teachers,
    classes,
    setCurrentDate,
    setCurrentView,
    setFilters,
    navigateWeek,
    goToToday,
    openCreateModal,
    readOnly,
  } = useScheduler();

  // Format display text based on view
  const getDisplayText = () => {
    if (currentView === "month") {
      return currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else if (currentView === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    } else {
      // Week view
      const weekStart = weekDates[0];
      const weekEnd = weekDates[6];
      return `${formatDate(weekStart, "short")} - ${formatDate(weekEnd, "short")}`;
    }
  };

  // Navigate based on current view
  const handleNavigate = (direction: "prev" | "next") => {
    if (currentView === "month") {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        return newDate;
      });
    } else if (currentView === "day") {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        return newDate;
      });
    } else {
      navigateWeek(direction);
    }
  };

  const handleViewChange = (key: React.Key) => {
    setCurrentView(key as SchedulerView);
  };

  const handleTeacherFilter = (value: string) => {
    setFilters({ ...filters, teacherId: value || undefined });
  };

  const handleClassFilter = (value: string) => {
    setFilters({ ...filters, classId: value || undefined });
  };

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters =
    filters.teacherId || filters.classId || filters.search;

  return (
    <div className="space-y-4">
      {/* Top row: Navigation & View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="bordered"
            size="sm"
            onPress={() => handleNavigate("prev")}
            aria-label="Previous"
          >
            <Icon icon="lucide:chevron-left" className="w-4 h-4" />
          </Button>

          <Button variant="bordered" size="sm" onPress={goToToday}>
            Today
          </Button>

          <Button
            isIconOnly
            variant="bordered"
            size="sm"
            onPress={() => handleNavigate("next")}
            aria-label="Next"
          >
            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
          </Button>

          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {getDisplayText()}
          </span>
        </div>

        {/* Actions & View Toggle */}
        <div className="flex items-center gap-3">
          {!readOnly && (
            <Button
              color="primary"
              size="sm"
              startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
              onPress={() => openCreateModal()}
            >
              Add Schedule
            </Button>
          )}

          <Tabs
            selectedKey={currentView}
            onSelectionChange={handleViewChange}
            size="sm"
            variant="bordered"
          >
            <Tab
              key="day"
              title={
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:calendar" className="w-4 h-4" />
                  <span className="hidden sm:inline">Day</span>
                </div>
              }
            />
            <Tab
              key="week"
              title={
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:calendar-days" className="w-4 h-4" />
                  <span className="hidden sm:inline">Week</span>
                </div>
              }
            />
            <Tab
              key="month"
              title={
                <div className="flex items-center gap-1">
                  <Icon icon="lucide:calendar-range" className="w-4 h-4" />
                  <span className="hidden sm:inline">Month</span>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>

      {/* Second row: Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <Input
          placeholder="Search class or teacher..."
          size="sm"
          className="w-full sm:w-64"
          value={filters.search || ""}
          onValueChange={handleSearchChange}
          startContent={
            <Icon icon="lucide:search" className="w-4 h-4 text-gray-400" />
          }
          isClearable
          onClear={() => handleSearchChange("")}
        />

        {/* Teacher Filter */}
        {!hideTeacherFilter && (
          <Autocomplete
            placeholder="All Teachers"
            aria-label="All Teachers"
            size="sm"
            className="w-full sm:w-48"
            selectedKey={filters.teacherId || null}
            onSelectionChange={(key) =>
              handleTeacherFilter((key as string) || "")
            }
          >
            {teachers.map((teacher) => (
              <AutocompleteItem key={teacher.id} textValue={teacher.name}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: teacher.color }}
                  />
                  {teacher.name}
                </div>
              </AutocompleteItem>
            ))}
          </Autocomplete>
        )}

        {/* Class Filter */}
        <Autocomplete
          placeholder="All Classes"
          aria-label="All Classes"
          size="sm"
          className="w-full sm:w-48"
          selectedKey={filters.classId || null}
          onSelectionChange={(key) => handleClassFilter((key as string) || "")}
        >
          {classes.map((cls) => (
            <AutocompleteItem
              key={cls.id}
              textValue={cls.code ? `${cls.code} - ${cls.name}` : cls.name}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="truncate">{cls.name}</span>
                {cls.code && (
                  <span className="text-xs font-mono text-default-400 bg-default-100 px-1.5 py-0.5 rounded-md shrink-0">
                    {cls.code}
                  </span>
                )}
              </div>
            </AutocompleteItem>
          ))}
        </Autocomplete>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="light"
            color="danger"
            onPress={clearFilters}
            startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
