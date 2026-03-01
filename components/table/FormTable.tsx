"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Chip,
  DatePicker,
  Autocomplete,
  AutocompleteItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { parseDate } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { useState, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";

// ==================== TYPES ====================

export interface FormTableColumn {
  /** Field key — harus match dengan key di data */
  key: string;
  /** Label header kolom */
  label: string;
  /** Tipe input yang dirender di cell */
  type?: "text" | "email" | "number" | "date" | "select" | "autocomplete";
  /** Opsi untuk type="select" */
  options?: { label: string; value: string }[];
  /** Wajib diisi? (default: false) */
  required?: boolean;
  /** Bisa diedit? (default: true) */
  editable?: boolean;
  /** Lebar minimum kolom dalam px (default: 200) */
  minWidth?: number;
  /** Placeholder input */
  placeholder?: string;
}

interface PaginatedItem<T> {
  key: string;
  row: T;
  globalIndex: number;
}

interface FormTableProps<T extends Record<string, unknown>> {
  columns: FormTableColumn[];
  data: T[];
  onChange: (data: T[]) => void;
  keyField?: string;
  enableDelete?: boolean;
  enableAdd?: boolean;
  emptyRowTemplate?: Partial<T>;
  title?: string;
  description?: string;
  pageSize?: number;
  showPagination?: boolean;
  enableUnsavedChangesWarning?: boolean;
}

// ==================== HELPERS ====================

function toIsoDate(d: CalendarDate): string {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function safeParseDate(str: string): CalendarDate | null {
  try {
    return str ? parseDate(str) : null;
  } catch {
    return null;
  }
}

// ==================== COMPONENT ====================

export function FormTable<T extends Record<string, unknown>>({
  columns,
  data,
  onChange,
  keyField = "key",
  enableDelete = true,
  enableAdd = false,
  emptyRowTemplate,
  title,
  description,
  pageSize = 20,
  showPagination = true,
  enableUnsavedChangesWarning = false,
}: FormTableProps<T>) {
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [editedRows, setEditedRows] = useState<Set<number>>(new Set());

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  const handlePageChangeRequest = (page: number) => {
    const start = (currentPage - 1) * internalPageSize;
    const end = start + internalPageSize;
    let hasEditsOnCurrentPage = false;
    for (let i = start; i < end; i++) {
      if (editedRows.has(i)) {
        hasEditsOnCurrentPage = true;
        break;
      }
    }

    if (enableUnsavedChangesWarning && hasEditsOnCurrentPage) {
      setPendingPage(page);
      onOpen();
    } else {
      setCurrentPage(page);
    }
  };

  const confirmPageChange = () => {
    if (pendingPage !== null) setCurrentPage(pendingPage);
    onClose();
    setPendingPage(null);
  };

  // ==================== HANDLERS ====================

  const handleCellChange = useCallback(
    (globalIndex: number, field: string, value: unknown) => {
      const newData = [...data];
      newData[globalIndex] = { ...newData[globalIndex], [field]: value };
      onChange(newData);
      setEditedRows((prev) => new Set([...prev, globalIndex]));
    },
    [data, onChange],
  );

  const handleDeleteRow = useCallback(
    (globalIndex: number) => {
      const newData = data.filter((_, i) => i !== globalIndex);
      onChange(newData);
      setEditedRows((prev) => {
        const next = new Set<number>();
        prev.forEach((i) => {
          if (i < globalIndex) next.add(i);
          else if (i > globalIndex) next.add(i - 1);
        });
        return next;
      });
    },
    [data, onChange],
  );

  const handleAddRow = useCallback(() => {
    const newRow = {
      ...(emptyRowTemplate ?? {}),
      [keyField]: `new-${Date.now()}`,
    } as T;
    onChange([...data, newRow]);
    const newTotal = data.length + 1;
    setCurrentPage(Math.ceil(newTotal / internalPageSize));
  }, [data, onChange, emptyRowTemplate, internalPageSize, keyField]);

  // ==================== COLUMNS ====================

  const allColumns: FormTableColumn[] = useMemo(() => {
    return [
      { key: "_rowNum", label: "#", editable: false, minWidth: 48 },
      ...columns.map((col) => ({ ...col, minWidth: col.minWidth ?? 200 })),
      ...(enableDelete
        ? [{ key: "_delete", label: "", editable: false, minWidth: 52 }]
        : []),
    ];
  }, [columns, enableDelete]);

  const columnMap = useMemo(
    () => Object.fromEntries(allColumns.map((c) => [c.key, c])),
    [allColumns],
  );

  // ==================== PAGINATION ====================

  const totalPages = Math.ceil(data.length / internalPageSize);

  const paginatedData = useMemo((): PaginatedItem<T>[] => {
    const start = (currentPage - 1) * internalPageSize;
    return data.slice(start, start + internalPageSize).map((row, i) => ({
      key: String(row[keyField] ?? start + i),
      row,
      globalIndex: start + i,
    }));
  }, [data, currentPage, internalPageSize, keyField]);

  // ==================== CELL RENDERER ====================

  const renderCell = useCallback(
    (row: T, globalIndex: number, column: FormTableColumn) => {
      // Row number
      if (column.key === "_rowNum") {
        return (
          <span className="text-xs text-default-400 font-mono tabular-nums select-none">
            {globalIndex + 1}
          </span>
        );
      }

      // Delete button
      if (column.key === "_delete") {
        return (
          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="light"
            onPress={() => handleDeleteRow(globalIndex)}
            aria-label={`Hapus baris ${globalIndex + 1}`}
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
          </Button>
        );
      }

      const value = row[column.key];
      const strValue =
        value === null || value === undefined ? "" : String(value);

      // Non-editable
      if (column.editable === false) {
        return <span className="text-sm">{strValue || "-"}</span>;
      }

      // ── Date picker ──────────────────────────────────────
      if (column.type === "date") {
        const dateValue = safeParseDate(strValue);
        return (
          <DatePicker
            aria-label={column.label}
            size="md"
            granularity="day"
            value={dateValue ?? undefined}
            onChange={(d) =>
              handleCellChange(globalIndex, column.key, d ? toIsoDate(d) : "")
            }
            isRequired={column.required}
            classNames={{ base: "w-full" }}
          />
        );
      }

      // ── Select ───────────────────────────────────────────
      if (column.type === "select" && column.options) {
        return (
          <Select
            aria-label={column.label}
            size="md"
            selectedKeys={strValue ? new Set([strValue]) : new Set<string>()}
            onSelectionChange={(keys) => {
              const arr = Array.from(keys as Set<string>);
              handleCellChange(globalIndex, column.key, arr[0] ?? "");
            }}
            disallowEmptySelection={column.required}
            className="w-full"
          >
            {column.options.map((opt) => (
              <SelectItem key={opt.value}>{opt.label}</SelectItem>
            ))}
          </Select>
        );
      }

      // ── Autocomplete ───────────────────────────────────────
      if (column.type === "autocomplete" && column.options) {
        return (
          <Autocomplete
            aria-label={column.label}
            size="md"
            selectedKey={strValue || null}
            onSelectionChange={(key) => {
              handleCellChange(globalIndex, column.key, (key as string) ?? "");
            }}
            allowsCustomValue
            className="w-full"
            placeholder={column.placeholder ?? column.label}
          >
            {column.options.map((opt) => (
              <AutocompleteItem key={opt.value}>{opt.label}</AutocompleteItem>
            ))}
          </Autocomplete>
        );
      }

      // ── Text / email / number ────────────────────────────
      return (
        <Input
          size="md"
          type={column.type ?? "text"}
          value={strValue}
          placeholder={column.placeholder ?? column.label}
          onValueChange={(val) =>
            handleCellChange(globalIndex, column.key, val)
          }
          isRequired={column.required}
          className="w-full"
        />
      );
    },
    [handleCellChange, handleDeleteRow],
  );

  // ==================== RENDER ====================

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && (
            <p className="text-sm text-default-500">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Chip size="sm" variant="flat" color="default">
            {data.length} baris
          </Chip>
          {editedRows.size > 0 && (
            <Chip size="sm" variant="flat" color="warning">
              <Icon
                icon="lucide:pencil"
                className="w-3 h-3 inline-block mr-1"
              />
              {editedRows.size} diubah
            </Chip>
          )}
          {enableAdd && (
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={handleAddRow}
              startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
            >
              Tambah Baris
            </Button>
          )}
        </div>
      </div>

      {/* Table — overflow-x-auto agar bisa scroll horizontal */}
      <div className="overflow-x-auto rounded-lg border border-divider">
        <Table
          aria-label="Editable data preview table"
          removeWrapper
          classNames={{
            th: "text-xs py-2.5 px-3 bg-default-100",
            td: "py-2 px-2 align-middle",
            tr: "border-b border-divider last:border-b-0",
          }}
        >
          <TableHeader columns={allColumns}>
            {(col) => (
              <TableColumn key={col.key}>
                {/*
                 * Width dikontrol lewat div inner — ini yang benar-benar
                 * mengatur lebar kolom, karena prop `width` di TableColumn
                 * sering diabaikan oleh HeroUI versi ini.
                 */}
                <div
                  style={{
                    minWidth:
                      col.key === "_rowNum" || col.key === "_delete"
                        ? undefined
                        : `${col.minWidth ?? 200}px`,
                  }}
                >
                  {col.label}
                  {col.required && (
                    <span className="text-danger ml-0.5">*</span>
                  )}
                </div>
              </TableColumn>
            )}
          </TableHeader>

          <TableBody<PaginatedItem<T>>
            items={paginatedData}
            emptyContent={
              <div className="flex flex-col items-center gap-2 py-8 text-default-400">
                <Icon icon="lucide:table-2" className="w-8 h-8" />
                <p className="text-sm">Tidak ada data</p>
              </div>
            }
          >
            {(item) => (
              <TableRow
                key={item.key}
                className={
                  editedRows.has(item.globalIndex)
                    ? "bg-warning-50 dark:bg-warning-900/10"
                    : ""
                }
              >
                {(columnKey) => {
                  const col = columnMap[String(columnKey)];
                  return (
                    <TableCell>
                      {col ? renderCell(item.row, item.globalIndex, col) : null}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination & Tools */}
      {showPagination && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-1 gap-3 sm:gap-0 mt-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-default-400">
              Halaman {currentPage} dari {totalPages} ({data.length} total
              baris)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-default-400">Per halaman:</span>
              <Select
                aria-label="Items per page"
                size="sm"
                className="w-20"
                selectedKeys={new Set([String(internalPageSize)])}
                onSelectionChange={(keys) => {
                  const val = Array.from(keys as Set<string>)[0];
                  if (val) {
                    setInternalPageSize(Number(val));
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectItem key="10">10</SelectItem>
                <SelectItem key="20">20</SelectItem>
                <SelectItem key="50">50</SelectItem>
                <SelectItem key="100">100</SelectItem>
              </Select>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              showControls
              page={currentPage}
              total={totalPages}
              onChange={handlePageChangeRequest}
              size="sm"
              color="primary"
            />
          )}
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {enableUnsavedChangesWarning && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setPendingPage(null);
          }}
        >
          <ModalContent>
            <ModalHeader>Unsaved Changes</ModalHeader>
            <ModalBody>
              <p className="text-sm">
                You have unsaved edits on the current page. If you proceed to
                change the page, your edits will remain but you might lose track
                of them.
              </p>
              <p className="text-sm font-medium">
                Are you sure you want to go to another page before saving?
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  onClose();
                  setPendingPage(null);
                }}
              >
                Stay Here
              </Button>
              <Button color="warning" onPress={confirmPageChange}>
                Proceed Anyway
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
