"use client";

import React, { useState } from "react";
import { Button, Select, SelectItem, Input, Tabs, Tab } from "@heroui/react";
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
          <Select
            placeholder="All Teachers"
            size="sm"
            className="w-full sm:w-40"
            selectedKeys={filters.teacherId ? [filters.teacherId] : []}
            onChange={(e) => handleTeacherFilter(e.target.value)}
          >
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} textValue={teacher.name}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: teacher.color }}
                  />
                  {teacher.name}
                </div>
              </SelectItem>
            ))}
          </Select>
        )}

        {/* Class Filter */}
        <Select
          placeholder="All Classes"
          size="sm"
          className="w-full sm:w-40"
          selectedKeys={filters.classId ? [filters.classId] : []}
          onChange={(e) => handleClassFilter(e.target.value)}
        >
          {classes.map((cls) => (
            <SelectItem key={cls.id} textValue={cls.name}>
              {cls.name}
            </SelectItem>
          ))}
        </Select>

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
