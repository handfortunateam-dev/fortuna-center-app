"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Selection } from "@heroui/react";
import { BulkAction } from "./types";

interface BulkActionsBarProps<T> {
  effectiveSelectionMode: "none" | "single" | "multiple";
  selectedCount: number;
  bulkActions: BulkAction<T>[];
  isBulkDeleting: boolean;
  pendingBulkAction: BulkAction<T> | null;
  onSelectionChange: (keys: Selection) => void;
  onBulkActionClick: (action: BulkAction<T>) => void;
}

export function BulkActionsBar<T>({
  effectiveSelectionMode,
  selectedCount,
  bulkActions,
  isBulkDeleting,
  pendingBulkAction,
  onSelectionChange,
  onBulkActionClick,
}: BulkActionsBarProps<T>) {
  return (
    <AnimatePresence>
      {effectiveSelectionMode !== "none" && selectedCount > 0 && (
        <motion.div
          key="bulk-bar"
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80"
          style={{ minWidth: 360 }}
        >
          {/* Count chip + deselect */}
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
              <Icon icon="lucide:check-square" className="w-4 h-4" />
              {selectedCount} selected
            </div>
            <button
              className="text-xs text-default-500 hover:text-default-700 dark:hover:text-default-300 transition-colors underline underline-offset-2"
              onClick={() => {
                onSelectionChange(new Set([]));
              }}
            >
              Clear
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                size="sm"
                color={action.color || "default"}
                variant={action.color === "danger" ? "solid" : "flat"}
                startContent={
                  action.icon ? (
                    <Icon icon={action.icon} className="w-4 h-4" />
                  ) : undefined
                }
                onPress={() => onBulkActionClick(action)}
                isLoading={
                  isBulkDeleting && pendingBulkAction?.key === action.key
                }
                className="font-semibold"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
