"use client";

import { useState, useMemo, useCallback } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  ScrollShadow,
  Select,
  SelectItem,
  Input,
  Tooltip,
  Chip,
} from "@heroui/react";
import * as XLSX from "xlsx";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { ListGrid } from "@/components/table";
import { UserRole } from "@/enums/common";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportResult {
  success: boolean;
  message: string;
  details?: { 
    success: number;
    failed: number;
    errors: string[];
    failedRows?: unknown[];
  };
}

type ImportMode = "file" | "manual";

interface ManualUserRow {
  _rowId: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole | "";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = Object.values(UserRole).map((role) => ({
  label: role.replace(/_/g, " "),
  value: role,
}));

/**
 * Generates a secure random password that satisfies Clerk's default requirements:
 * ≥ 8 chars, mix of upper, lower, digit, and symbol.
 */
function generateSecurePassword(): string {
  const length = 16;
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each required character class
  const guaranteed = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const rest = Array.from(
    { length: length - guaranteed.length },
    () => all[Math.floor(Math.random() * all.length)],
  );

  // Shuffle the combined array
  return [...guaranteed, ...rest].sort(() => Math.random() - 0.5).join("");
}

function createEmptyRow(): ManualUserRow {
  return {
    _rowId: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: "",
    firstName: "",
    lastName: "",
    password: generateSecurePassword(), // ← auto-generated on creation
    role: "",
  };
}

// ─── Manual Row Editor ────────────────────────────────────────────────────────

function ManualRowEditor({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: ManualUserRow;
  index: number;
  onChange: (id: string, field: keyof ManualUserRow, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleRegenPass = () => {
    onChange(row._rowId, "password", generateSecurePassword());
  };

  const isRowValid = row.email.trim() && row.firstName.trim() && row.role;

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${
        isRowValid
          ? "hover:bg-green-50/40 dark:hover:bg-green-900/10"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      {/* Row # + valid indicator */}
      <td className="px-3 py-2 text-center w-10 select-none">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
          {isRowValid && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          )}
        </div>
      </td>

      {/* Email */}
      <td className="px-2 py-1.5">
        <Input
          size="sm"
          variant="bordered"
          placeholder="user@example.com"
          type="email"
          value={row.email}
          onValueChange={(v) => onChange(row._rowId, "email", v)}
          classNames={{ inputWrapper: "h-8 min-h-8" }}
          isInvalid={
            !!row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
          }
        />
      </td>

      {/* First Name */}
      <td className="px-2 py-1.5">
        <Input
          size="sm"
          variant="bordered"
          placeholder="John"
          value={row.firstName}
          onValueChange={(v) => onChange(row._rowId, "firstName", v)}
          classNames={{ inputWrapper: "h-8 min-h-8" }}
        />
      </td>

      {/* Last Name */}
      <td className="px-2 py-1.5">
        <Input
          size="sm"
          variant="bordered"
          placeholder="Doe"
          value={row.lastName}
          onValueChange={(v) => onChange(row._rowId, "lastName", v)}
          classNames={{ inputWrapper: "h-8 min-h-8" }}
        />
      </td>

      {/* Password – auto-generated, editable, with show/hide + regenerate */}
      <td className="px-2 py-1.5 min-w-[220px]">
        <div className="flex items-center gap-1">
          <Input
            size="sm"
            variant="bordered"
            type={showPassword ? "text" : "password"}
            value={row.password}
            onValueChange={(v) => onChange(row._rowId, "password", v)}
            classNames={{ inputWrapper: "h-8 min-h-8" }}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <Icon
                  icon={showPassword ? "lucide:eye-off" : "lucide:eye"}
                  className="w-3.5 h-3.5"
                />
              </button>
            }
          />
          <Tooltip content="Regenerate password">
            <button
              type="button"
              onClick={handleRegenPass}
              className="shrink-0 text-gray-400 hover:text-primary transition-colors p-1 rounded-md"
            >
              <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      </td>

      {/* Role */}
      <td className="px-2 py-1.5 min-w-[175px]">
        <Select
          size="sm"
          variant="bordered"
          placeholder="Select role"
          selectedKeys={row.role ? [row.role] : []}
          onSelectionChange={(keys) => {
            const val = Array.from(keys)[0] as string;
            onChange(row._rowId, "role", val ?? "");
          }}
          classNames={{ trigger: "h-8 min-h-8" }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
      </td>

      {/* Copy password */}
      <td className="px-1 py-1.5 w-8 text-center">
        <Tooltip content="Copy password">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(row.password);
              Toast({
                title: "Copied",
                description: "Password copied to clipboard",
                color: "success",
              });
            }}
            className="text-gray-300 hover:text-primary transition-colors p-1 rounded-md"
          >
            <Icon icon="lucide:copy" className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </td>

      {/* Remove */}
      <td className="px-1 py-1.5 w-8 text-center">
        <Tooltip content="Remove row" color="danger">
          <button
            type="button"
            onClick={() => onRemove(row._rowId)}
            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md"
          >
            <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImportUsersPage() {
  const resource = "users";
  const resourceLabel = "Users";

  // ── Shared ──
  const [importMode, setImportMode] = useState<ImportMode>("file");
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ── File import ──
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [createUserAccounts, setCreateUserAccounts] = useState(true);

  // ── Manual entry ──
  const [manualRows, setManualRows] = useState<ManualUserRow[]>([
    createEmptyRow(),
  ]);
  const [saveToExcel, setSaveToExcel] = useState(true);

  // ─── File Handlers ───────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const parseFile = async (f: File) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        Toast({
          title: "Warning",
          description: "File is empty or could not be parsed",
          color: "warning",
        });
        setPreviewData([]);
      } else {
        const dataWithKeys = jsonData.map((row: unknown, index) => {
          const r = row as Record<string, unknown>;
          return {
            ...r,
            id: (r.id as string) || `row-${index}`,
            key: (r.id as string) || `row-${index}`,
          };
        });
        setPreviewData(dataWithKeys);
        Toast({
          title: "Success",
          description: `File parsed! Found ${dataWithKeys.length} rows.`,
          color: "success",
        });
      }
    } catch {
      Toast({
        title: "Error",
        description: "Failed to parse file. Ensure it's a valid Excel/CSV.",
        color: "danger",
      });
      setPreviewData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const previewColumns = useMemo(() => {
    if (previewData.length === 0) return [];
    const keys = Object.keys(previewData[0]).filter(
      (k) => k !== "key" && k !== "_originalItem",
    );
    return keys.map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      value: (item: unknown) => {
        const typedItem = item as Record<string, unknown>;
        const val = typedItem[key];
        if (typeof val === "object" && val !== null) return JSON.stringify(val);
        return val as React.ReactNode;
      },
    }));
  }, [previewData]);

  // ─── Manual Row Handlers ─────────────────────────────────────────────────────

  const handleManualRowChange = useCallback(
    (id: string, field: keyof ManualUserRow, value: string) => {
      setManualRows((prev) =>
        prev.map((r) => (r._rowId === id ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  const handleAddRow = () =>
    setManualRows((prev) => [...prev, createEmptyRow()]);

  const handleAddMultipleRows = (count: number) => {
    setManualRows((prev) => [
      ...prev,
      ...Array.from({ length: count }, () => createEmptyRow()),
    ]);
  };

  const handleRemoveRow = useCallback((id: string) => {
    setManualRows((prev) => {
      if (prev.length === 1) return [createEmptyRow()];
      return prev.filter((r) => r._rowId !== id);
    });
  }, []);

  const handleClearAll = () => setManualRows([createEmptyRow()]);

  // A row is "valid" if it has email, firstName and role all filled in
  const validManualRows = manualRows.filter(
    (r) => r.email.trim() && r.firstName.trim() && r.role,
  );

  /**
   * Downloads valid rows as an Excel file with credentials.
   * Plain-text passwords are included so admins can share login info with users.
   */
  const downloadUsersAsExcel = (rows: ManualUserRow[]) => {
    const exportData = rows.map((r, i) => ({
      No: i + 1,
      Email: r.email,
      "First Name": r.firstName,
      "Last Name": r.lastName,
      Role: r.role,
      Password: r.password, // plain-text — keep this file secure!
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Column widths
    ws["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 24 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "User Credentials");
    XLSX.writeFile(
      wb,
      `users_bulk_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // ─── Upload handlers ─────────────────────────────────────────────────────────

  const handleFileUpload = async () => {
    if (!file || previewData.length === 0) {
      Toast({
        title: "Error",
        description: "No data to import",
        color: "danger",
      });
      return;
    }
    setIsUploading(true);
    try {
      const cleanData = previewData.map((row) => {
        const omitKeys = new Set(["id", "key", "_originalItem"]);
        return Object.fromEntries(
          Object.entries(row).filter(([k]) => !omitKeys.has(k)),
        );
      });
      const response = await fetch(`/api/import/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: cleanData, createUserAccounts }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to import");
      setImportResult(result);
      Toast({
        title: "Import Finished",
        description: result.message,
        color: "success",
      });
    } catch (err) {
      Toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to import",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Manual bulk submit — always uses createUserAccounts: true so every user
   * gets created in BOTH Clerk and the local database, exactly like /api/users/create.
   */
  const handleManualUpload = async () => {
    if (validManualRows.length === 0) {
      Toast({
        title: "Error",
        description:
          "Please fill in at least one row with Email, First Name, and Role",
        color: "danger",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Strip internal _rowId, send only the data fields the API expects
      const cleanData = validManualRows.map((row) => {
        const { _rowId, ...rest } = row;
        void _rowId;
        return rest;
      });

      // ── Download credentials to Excel BEFORE submitting so data is never lost
      if (saveToExcel) {
        downloadUsersAsExcel(validManualRows);
      }

      const response = await fetch(`/api/import/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: cleanData,
          createUserAccounts: true, // always true for manual entry → saves to Clerk + DB
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to create users");

      setImportResult(result);
      Toast({
        title: "Users Created",
        description: result.message,
        color: "success",
      });
    } catch (err) {
      Toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to create users",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Misc ────────────────────────────────────────────────────────────────────

  const downloadFailedRows = () => {
    if (!importResult?.details?.failedRows?.length) {
      Toast({
        title: "Info",
        description: "No failed rows to download",
        color: "primary",
      });
      return;
    }
    const ws = XLSX.utils.json_to_sheet(importResult.details.failedRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Failed Rows");
    XLSX.writeFile(
      wb,
      `failed_users_import_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setCreateUserAccounts(true);
    setManualRows([createEmptyRow()]);
    const fi = document.getElementById("file-upload") as HTMLInputElement;
    if (fi) fi.value = "";
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Import Data: {resourceLabel}</Heading>
        <p className="text-gray-500 dark:text-gray-400">
          Import user accounts — tersimpan di Clerk dan database sistem.
        </p>
      </div>

      {/* ── Result screen ─────────────────────────────────────────────────────── */}
      {importResult ? (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon icon="lucide:clipboard-check" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-semibold">Import Results</p>
              <p className="text-small text-default-500">
                {importResult.message}
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-8 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 border rounded-xl border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full text-green-700 dark:text-green-300">
                  <Icon icon="lucide:check" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Berhasil Dibuat
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {importResult.details?.success || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 border rounded-xl border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div className="p-3 bg-red-200 dark:bg-red-800 rounded-full text-red-700 dark:text-red-300">
                  <Icon icon="lucide:alert-triangle" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Gagal
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResult.details?.failed || 0}
                  </p>
                </div>
                {importResult.details?.failedRows &&
                  importResult.details.failedRows.length > 0 && (
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Icon icon="lucide:download" />}
                        onPress={downloadFailedRows}
                      >
                        Download Failed Rows
                      </Button>
                    </div>
                  )}
              </div>
            </div>

            {importResult.details?.errors &&
              importResult.details.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                    Error Details:
                  </p>
                  <ScrollShadow className="w-full h-[300px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                    <ul className="space-y-2">
                      {importResult.details.errors.map((err, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-red-500 mt-1">•</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollShadow>
                </div>
              )}

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="bordered" onPress={() => window.history.back()}>
                Return to List
              </Button>
              <Button color="primary" onPress={handleReset}>
                Buat Lagi
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* ── Mode Tabs ─────────────────────────────────────────────────────── */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setImportMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                importMode === "file"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon icon="lucide:upload-cloud" className="w-4 h-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setImportMode("manual")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                importMode === "manual"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon icon="lucide:table-2" className="w-4 h-4" />
              Manual Entry
              <Chip
                size="sm"
                color="primary"
                variant="flat"
                className="h-5 text-[10px]"
              >
                Bulk
              </Chip>
            </button>
          </div>

          {/* ═══════════════ FILE IMPORT ═══════════════ */}
          {importMode === "file" && (
            <>
              {!previewData.length ? (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                  <CardHeader className="flex gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Icon icon="lucide:upload-cloud" className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-md font-semibold">Upload File</p>
                      <p className="text-small text-default-500">
                        Choose a file from your computer to preview
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody className="px-6 py-8">
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-colors ${
                        isParsing
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        disabled={isParsing}
                      />

                      {file ? (
                        <div className="flex flex-col items-center gap-2">
                          <Icon
                            icon="lucide:file-spreadsheet"
                            className="w-12 h-12 text-primary"
                          />
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => {
                                setFile(null);
                                setPreviewData([]);
                                const fi = document.getElementById(
                                  "file-upload",
                                ) as HTMLInputElement;
                                if (fi) fi.value = "";
                              }}
                              className="mt-2"
                            >
                              Remove File
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              variant="solid"
                              onPress={() => parseFile(file)}
                              className="mt-2"
                              isLoading={isParsing}
                            >
                              Process File
                            </Button>
                          </div>
                        </div>
                      ) : isParsing ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm font-medium text-gray-500">
                            Processing file...
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <Icon icon="lucide:file-up" className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Click to upload or drag &amp; drop
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              XLSX, CSV (Max. 10MB)
                            </p>
                          </div>
                          <Button
                            as="label"
                            htmlFor="file-upload"
                            color="primary"
                            variant="flat"
                            className="mt-4 cursor-pointer"
                          >
                            Select File
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        variant="bordered"
                        onPress={() => window.history.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="border border-green-200 dark:border-green-900 shadow-sm bg-green-50/50 dark:bg-green-900/10">
                    <CardBody className="flex flex-row items-center justify-between p-4">
                      <div className="flex flex-row items-center gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-200">
                          <Icon icon="lucide:file-check" className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-md font-semibold text-green-800 dark:text-green-200">
                            File Parsed Successfully
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {file?.name} ({previewData.length} records found)
                          </p>
                        </div>
                      </div>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={handleReset}
                        startContent={<Icon icon="lucide:x" />}
                      >
                        Cancel / Re-upload
                      </Button>
                    </CardBody>
                  </Card>

                  <ListGrid
                    title="Data Preview"
                    description={`Previewing data from ${file?.name}`}
                    columns={previewColumns}
                    data={previewData}
                    enableSearch={true}
                    searchPlaceholder="Search within preview..."
                    enableCreate={false}
                    enableEdit={false}
                    enableDelete={false}
                    enableExport={false}
                    enableImport={false}
                  />

                  <div className="flex justify-between items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
                    <Checkbox
                      isSelected={createUserAccounts}
                      onValueChange={setCreateUserAccounts}
                      color="primary"
                    >
                      <span className="text-sm font-medium">
                        Buat akun user juga (untuk login sistem) – password
                        wajib diisi
                      </span>
                    </Checkbox>
                    <div className="flex gap-3 ml-auto">
                      <Button
                        variant="bordered"
                        size="lg"
                        onPress={handleReset}
                      >
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        size="lg"
                        isLoading={isUploading}
                        onPress={handleFileUpload}
                        startContent={
                          !isUploading && <Icon icon="lucide:check-circle" />
                        }
                      >
                        Confirm Import
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════ MANUAL ENTRY ═══════════════ */}
          {importMode === "manual" && (
            <div className="space-y-6">
              {/* Info banner */}
              <Card className="border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm">
                <CardBody className="flex flex-row items-start gap-3 p-4">
                  <Icon
                    icon="lucide:info"
                    className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"
                  />
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-0.5">
                    <p className="font-semibold">
                      Akun tersimpan di Clerk + Database
                    </p>
                    <p className="text-blue-600/80 dark:text-blue-400/80">
                      Setiap user yang berhasil dibuat akan langsung terdaftar
                      di Clerk (untuk login) dan juga disimpan di database
                      sistem. Password di-generate otomatis — kamu bisa salin
                      atau ubah sebelum submit. Kolom wajib:{" "}
                      <strong>Email, First Name, Role</strong>.
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Table card */}
              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Icon icon="lucide:table-2" className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-md font-semibold">Manual Bulk Entry</p>
                      <p className="text-small text-default-500">
                        Isi data user langsung di tabel. Password otomatis
                        ter-generate setiap baris baru.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    <Chip color="default" variant="flat" size="sm">
                      {manualRows.length} baris
                    </Chip>
                    {validManualRows.length > 0 && (
                      <Chip color="success" variant="flat" size="sm">
                        {validManualRows.length} valid
                      </Chip>
                    )}
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      startContent={
                        <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                      }
                      onPress={handleClearAll}
                    >
                      Clear All
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/70 border-b border-gray-200 dark:border-gray-700">
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">
                            #
                          </th>
                          <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[200px]">
                            Email <span className="text-red-400">*</span>
                          </th>
                          <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">
                            First Name <span className="text-red-400">*</span>
                          </th>
                          <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[130px]">
                            Last Name
                          </th>
                          <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[230px]">
                            Password
                            <span className="ml-1 text-[10px] font-normal text-gray-400 normal-case">
                              (auto-generated)
                            </span>
                          </th>
                          <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[175px]">
                            Role <span className="text-red-400">*</span>
                          </th>
                          <th className="px-1 py-2.5 w-8" />
                          <th className="px-1 py-2.5 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {manualRows.map((row, idx) => (
                          <ManualRowEditor
                            key={row._rowId}
                            row={row}
                            index={idx}
                            onChange={handleManualRowChange}
                            onRemove={handleRemoveRow}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add row controls */}
                  <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={
                        <Icon icon="lucide:plus" className="w-4 h-4" />
                      }
                      onPress={handleAddRow}
                    >
                      Add Row
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => handleAddMultipleRows(5)}
                    >
                      +5 Rows
                    </Button>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      onPress={() => handleAddMultipleRows(10)}
                    >
                      +10 Rows
                    </Button>
                    <span className="text-xs text-gray-400 ml-auto">
                      Rows dengan kolom wajib terisi akan disubmit
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Sticky footer */}
              <div className="flex justify-between items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
                    <Icon icon="lucide:shield-check" className="w-4 h-4" />
                    Disimpan ke Clerk + Database
                  </div>
                  <p className="text-xs text-gray-400">
                    {validManualRows.length === 0
                      ? "Belum ada baris yang valid"
                      : `${validManualRows.length} dari ${manualRows.length} baris siap disubmit`}
                  </p>
                  {/* Save to Excel option */}
                  <Checkbox
                    isSelected={saveToExcel}
                    onValueChange={setSaveToExcel}
                    color="success"
                    size="sm"
                    classNames={{ label: "text-xs" }}
                  >
                    <span className="text-xs font-medium">
                      Simpan data akun ke Excel (termasuk password)
                    </span>
                  </Checkbox>
                  {saveToExcel && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Icon icon="lucide:triangle-alert" className="w-3 h-3 shrink-0" />
                      File Excel berisi password polos — simpan dengan aman
                    </p>
                  )}
                </div>
                <div className="flex gap-3 ml-auto">
                  <Button
                    variant="bordered"
                    size="lg"
                    onPress={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    size="lg"
                    isLoading={isUploading}
                    isDisabled={validManualRows.length === 0}
                    onPress={handleManualUpload}
                    startContent={
                      !isUploading && <Icon icon="lucide:user-plus" />
                    }
                  >
                    {isUploading
                      ? "Membuat..."
                      : validManualRows.length > 0
                        ? `Buat ${validManualRows.length} User`
                        : "Buat Users"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Template tip – file mode only */}
          {importMode === "file" && !previewData.length && (
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
              <CardBody className="flex flex-row items-start gap-4 p-4">
                <Icon
                  icon="lucide:info"
                  className="w-5 h-5 text-blue-500 mt-0.5"
                />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Need a Template?
                  </h4>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                    Ensure your file format is correct. Download the import
                    template for {resource}.
                  </p>
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="w-fit px-0 h-auto min-h-0 mt-1 font-medium"
                    startContent={
                      <Icon icon="lucide:download" className="w-4 h-4" />
                    }
                    onPress={() => {
                      window.location.href = `/api/template/${resource}`;
                    }}
                  >
                    Download {resourceLabel} Template
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
