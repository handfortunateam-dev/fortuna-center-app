"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Checkbox,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Column } from "./types";

interface ColumnVisibilityDropdownProps<T> {
  enableColumnVisibility: boolean;
  hideableColumns: Column<T>[];
  visibleColumns: Set<string>;
  setVisibleColumns: (cols: Set<string>) => void;
  columnVisibilityStorageKey?: string;
  onVisibleColumnsChange?: (columns: string[]) => void;
  toggleColumnVisibility: (key: string) => void;
}

export function ColumnVisibilityDropdown<T>({
  enableColumnVisibility,
  hideableColumns,
  visibleColumns,
  setVisibleColumns,
  columnVisibilityStorageKey,
  onVisibleColumnsChange,
  toggleColumnVisibility,
}: ColumnVisibilityDropdownProps<T>) {
  if (!enableColumnVisibility || hideableColumns.length === 0) return null;

  const hiddenCount =
    hideableColumns.length -
    visibleColumns.size +
    (visibleColumns.has("actions") ? 1 : 0);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="lg"
          variant="flat"
          startContent={<Icon icon="lucide:columns-3" className="w-6 h-6" />}
        >
          Kolom
          {hiddenCount > 0 && (
            <Chip size="sm" color="primary" variant="flat" className="ml-1">
              {hiddenCount} tersembunyi
            </Chip>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Column visibility"
        closeOnSelect={false}
        selectionMode="multiple"
        selectedKeys={visibleColumns}
        onSelectionChange={(keys) => {
          const newKeys = keys as Set<string>;
          // Ensure at least one column remains visible
          if (newKeys.size > 0) {
            setVisibleColumns(newKeys);
            if (columnVisibilityStorageKey && typeof window !== "undefined") {
              localStorage.setItem(
                columnVisibilityStorageKey,
                JSON.stringify(Array.from(newKeys)),
              );
            }
            onVisibleColumnsChange?.(Array.from(newKeys));
          }
        }}
      >
        {hideableColumns.map((col) => (
          <DropdownItem key={col.key}>
            <div className="flex items-center gap-2">
              <Checkbox
                isSelected={visibleColumns.has(col.key)}
                size="sm"
                onValueChange={() => toggleColumnVisibility(col.key)}
              />
              <span>{col.label}</span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
