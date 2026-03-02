"use client";

import { getKeyValue, Checkbox } from "@heroui/react";
import { Row, Column, TypedRow } from "./types";

interface MobileCardProps<T> {
  item: Row;
  filteredColumns: Column<T>[];
  handleRowClick: ((row: Row) => void) | null;
  selectionMode: "none" | "single" | "multiple";
  selectedKeys: import("@heroui/react").Selection;
  rows: (TypedRow<T> | Row)[];
  onSelectionChange: (keys: import("@heroui/react").Selection) => void;
}

export function MobileCard<T>({
  item,
  filteredColumns,
  handleRowClick,
  selectionMode,
  selectedKeys,
  rows,
  onSelectionChange,
}: MobileCardProps<T>) {
  const mobileColumns = filteredColumns.filter((col) => col.key !== "actions");

  const isSelected =
    selectedKeys === "all" || (selectedKeys as Set<string>).has(item.key);

  const renderCheckbox = () => {
    if (selectionMode === "none") return null;
    return (
      <div
        className="absolute top-3 right-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          isSelected={isSelected}
          onValueChange={(checked) => {
            const newSelection = new Set(
              selectedKeys === "all"
                ? rows.map((r) => r.key)
                : (selectedKeys as Set<string>),
            );
            if (checked) {
              newSelection.add(item.key);
            } else {
              newSelection.delete(item.key);
            }
            onSelectionChange(newSelection);
          }}
        />
      </div>
    );
  };

  return (
    <div
      key={item.key}
      className={`relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
        handleRowClick ? "cursor-pointer" : ""
      }`}
      onClick={() => handleRowClick?.(item)}
      role={handleRowClick ? "button" : undefined}
      tabIndex={handleRowClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (handleRowClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleRowClick(item);
        }
      }}
    >
      {renderCheckbox()}

      {/* Colored top border */}
      <div className="h-1 bg-linear-to-r from-gray-500 to-gray-900" />

      <div className="p-4 space-y-3">
        {mobileColumns.map((column, columnIndex) => (
          <div
            key={`${item.key}-${column.key}`}
            className={`flex flex-col ${
              columnIndex !== mobileColumns.length - 1
                ? "pb-3 border-b border-gray-100 dark:border-gray-800"
                : ""
            }`}
          >
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {column.label}
            </div>
            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
              {typeof item[column.key] === "object" && item[column.key] !== null
                ? item[column.key]
                : getKeyValue(item, column.key) || "-"}
            </div>
          </div>
        ))}

        {/* Actions for mobile */}
        {item.actions && (
          <div
            className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {item.actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface MobileSkeletonProps {
  pageSize: number;
  columnsCount: number;
}

export function MobileSkeleton({
  pageSize,
  columnsCount,
}: MobileSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: pageSize }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="h-1 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-4 space-y-3">
            {Array.from({ length: columnsCount }).map((_, columnIndex) => (
              <div
                key={columnIndex}
                className={`${
                  columnIndex !== columnsCount - 1
                    ? "pb-3 border-b border-gray-100 dark:border-gray-800"
                    : ""
                }`}
              >
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
