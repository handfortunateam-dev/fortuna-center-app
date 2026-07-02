"use client";

import { Button, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { Icon } from "@iconify/react";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "text";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

interface FiltersPanelProps {
  filterConfigs: FilterConfig[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

export function FiltersPanel({
  filterConfigs,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FiltersPanelProps) {
  if (filterConfigs.length === 0) return null;

  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v && v !== "" && v !== "all",
  ).length;

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          isIconOnly
          size="lg"
          variant="light"
          className="relative overflow-visible"
        >
          <Icon icon="lucide:filter" className="w-6 h-6" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center pointer-events-none">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-52">
        <div className="max-h-64 overflow-y-auto w-full">
          {activeFilterCount > 0 && (
            <div className="sticky top-0 bg-white dark:bg-default-100 border-b border-default-200 z-10">
              <Button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                onPress={onClearAll}
                isIconOnly
              >
                <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                Clear all filters
              </Button>
            </div>
          )}
          {filterConfigs.map((filter, index) => (
            <div
              key={filter.key}
              className={
                index < filterConfigs.length - 1
                  ? "border-b border-default-200"
                  : ""
              }
            >
              <div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold text-default-500 uppercase tracking-wider">
                {filter.label}
              </div>
              {[{ label: "All", value: "" }, ...(filter.options || [])].map(
                (opt) => {
                  const isActive =
                    opt.value === ""
                      ? !activeFilters[filter.key] ||
                        activeFilters[filter.key] === ""
                      : activeFilters[filter.key] === opt.value;
                  return (
                    <button
                      key={opt.value || "__all__"}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "text-primary bg-primary-50 dark:bg-primary-900/20"
                          : "text-default-700 hover:bg-default-100 dark:hover:bg-default-800"
                      }`}
                      onClick={() => onFilterChange(filter.key, opt.value)}
                    >
                      {opt.label}
                      {isActive && (
                        <Icon
                          icon="lucide:check"
                          className="w-3.5 h-3.5 text-primary shrink-0"
                        />
                      )}
                    </button>
                  );
                },
              )}
              <div className="pb-1" />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
