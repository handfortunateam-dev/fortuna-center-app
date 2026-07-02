"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface RowsPerPageSelectorProps {
  rowsPerPageOptions: number[];
  internalPageSize: number;
  setInternalPageSize: (size: number) => void;
  onPageSizeChange?: (size: number) => void;
  onPageChange: (page: number) => void;
}

export function RowsPerPageSelector({
  rowsPerPageOptions,
  internalPageSize,
  setInternalPageSize,
  onPageSizeChange,
  onPageChange,
}: RowsPerPageSelectorProps) {
  if (!rowsPerPageOptions || rowsPerPageOptions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 whitespace-nowrap">Rows:</span>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" size="md" className="min-w-[80px]">
            {internalPageSize}
            <Icon icon="lucide:chevron-down" className="w-4 h-4 ml-1" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Rows per page"
          disallowEmptySelection
          selectionMode="single"
          selectedKeys={new Set([internalPageSize.toString()])}
          onSelectionChange={(keys) => {
            const size = Number(Array.from(keys)[0]);
            setInternalPageSize(size);
            onPageSizeChange?.(size);
            onPageChange(1);
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <DropdownItem key={option.toString()}>{option}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
