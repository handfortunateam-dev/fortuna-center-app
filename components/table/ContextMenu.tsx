"use client";

import { Icon } from "@iconify/react";
import { Row } from "./types";

interface ContextMenuProps {
  contextMenu: { x: number; y: number; row: Row } | null;
  enableShow: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  finalActionButtons: {
    show?: { onClick: (id: string) => void };
    edit?: { onClick: (id: string) => void };
  } | null;
  onSelect: (row: Row) => void;
  onDelete: (row: Row) => void;
  onClose: () => void;
}

export function ContextMenu({
  contextMenu,
  enableShow,
  enableEdit,
  enableDelete,
  finalActionButtons,
  onSelect,
  onDelete,
  onClose,
}: ContextMenuProps) {
  if (!contextMenu) return null;

  const { x, y, row } = contextMenu;

  return (
    <div
      className="fixed z-[9999] min-w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {enableShow && finalActionButtons?.show && (
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-default-700 hover:bg-default-100 dark:hover:bg-default-800 transition-colors text-left"
          onClick={() => {
            finalActionButtons.show!.onClick(String(row.id || row.key));
            onClose();
          }}
        >
          <Icon icon="lucide:eye" className="w-4 h-4 text-default-500" />
          View Detail
        </button>
      )}
      {enableEdit && finalActionButtons?.edit && (
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-default-700 hover:bg-default-100 dark:hover:bg-default-800 transition-colors text-left"
          onClick={() => {
            finalActionButtons.edit!.onClick(String(row.id || row.key));
            onClose();
          }}
        >
          <Icon icon="lucide:pencil" className="w-4 h-4 text-blue-500" />
          Edit
        </button>
      )}
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-default-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left"
        onClick={() => onSelect(row)}
      >
        <Icon icon="lucide:check-square" className="w-4 h-4 text-primary" />
        Select / Mark
      </button>
      {enableDelete && (
        <>
          <div className="border-t border-default-100 dark:border-default-800 my-1" />
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors text-left"
            onClick={() => onDelete(row)}
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
            Delete
          </button>
        </>
      )}
    </div>
  );
}
