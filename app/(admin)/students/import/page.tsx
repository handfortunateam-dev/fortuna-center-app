"use client";

import { Heading } from "@/components/heading";
import { FormTable } from "@/components/table/FormTable";
import { Text } from "@/components/text";
import { Toast } from "@/components/toast";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

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

import {
  classifyEducationOrOccupation,
  EXCEL_COLUMN_MAP,
  normalizeEducation,
  normalizeGender,
  normalizeOccupation,
  normalizePhone,
  parseExcelDate,
  parsePlaceAndDateOfBirth,
  splitFullName,
  toTitleCase,
} from "@/features/lms/students/imports/utils";
import { previewColumns } from "./columnsPreview";
import SearchBar from "@/components/search-bar";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImportStudentsPage() {
  const resource = "students";
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const resourceLabel = "Students";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  /**
   * Normalise a generic Excel header to camelCase (fallback for unrecognised headers).
   * "First Name" → "firstName", "first_name" → "firstName"
   */
  const normalizeKey = (str: string): string => {
    if (!/[\s_]/.test(str)) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str
      .toLowerCase()
      .replace(/[\s_]+(.)/g, (_, char: string) => char.toUpperCase());
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellDates: true,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<
        string,
        unknown
      >[];

      if (jsonData.length === 0) {
        Toast({
          title: "Warning",
          description: "File is empty or could not be parsed",
          color: "warning",
        });
        setPreviewData([]);
        return;
      }

      // Detect whether this file uses the known Excel column format
      const firstRowHeaders = Object.keys(jsonData[0]).map((h) =>
        h.trim().toUpperCase(),
      );
      const isKnownExcelFormat = firstRowHeaders.some(
        (h) => h in EXCEL_COLUMN_MAP,
      );

      // For the known format, skip annotation/note rows (rows where NO is not a positive number).
      // NO may be an integer (45), a float (16.786), or a string ("16.786") depending on the file.
      // Only apply the NO filter if the file actually has a "NO" column — files exported from a
      // previous failed-rows download use internal camelCase field names (e.g. "gender", "address")
      // that also happen to match EXCEL_COLUMN_MAP, but have no "NO" column, so without this guard
      // every row would be filtered out and the user would see the "empty file" error.
      const hasNoColumn = firstRowHeaders.includes("NO");
      const filteredData =
        isKnownExcelFormat && hasNoColumn
          ? jsonData.filter((row) => {
              const no = row["NO"];
              if (typeof no === "number") return no > 0;
              if (typeof no === "string" && no.trim()) {
                const num = parseFloat(no.replace(/,/g, ""));
                return !isNaN(num) && num > 0;
              }
              return false;
            })
          : jsonData;

      if (filteredData.length === 0) {
        Toast({
          title: "Warning",
          description: "File is empty or could not be parsed",
          color: "warning",
        });
        setPreviewData([]);
        return;
      }

      const dataWithKeys = filteredData.map((row, index) => {
        const normalized: Record<string, unknown> = {};

        // ── Extract fallback year from NO. INDUK before processing columns ──
        // NO. INDUK format: "15.821/I/2021" — year is the 4-digit number after
        // the last "/" (Roman-numeral month separator).
        // This fallback is used when TGL. REGISTRASI has no year (e.g. "January, 7th").
        let fallbackYear: number | undefined;
        if (isKnownExcelFormat) {
          for (const [rk, rv] of Object.entries(row)) {
            if (rk.trim().toUpperCase().includes("INDUK")) {
              const ym = String(rv ?? "").match(/\/(\d{4})$/);
              if (ym) fallbackYear = parseInt(ym[1]);
              break;
            }
          }
        }

        for (const [rawKey, value] of Object.entries(row)) {
          const upperKey = rawKey.trim().toUpperCase();

          if (isKnownExcelFormat && upperKey in EXCEL_COLUMN_MAP) {
            const mappedKey = EXCEL_COLUMN_MAP[upperKey];
            if (mappedKey === null) continue; // skip NO, ID

            if (mappedKey === "__fullName") {
              const { firstName, middleName, lastName } = splitFullName(value);
              normalized.firstName = firstName;
              normalized.middleName = middleName;
              normalized.lastName = lastName;
            } else if (mappedKey === "studentId") {
              normalized.studentId =
                typeof value === "string"
                  ? value.trim()
                  : String(value ?? "").trim();
            } else if (mappedKey === "__educationOrOccupation") {
              const { education, occupation } =
                classifyEducationOrOccupation(value);
              normalized.education = education;
              normalized.occupation = occupation;
            } else if (mappedKey === "registrationDate") {
              normalized.registrationDate = parseExcelDate(value, fallbackYear);
            } else if (mappedKey === "gender") {
              normalized.gender = normalizeGender(value);
            } else if (mappedKey === "phone") {
              normalized.phone = normalizePhone(value);
            } else if (mappedKey === "placeOfBirth") {
              const { placeOfBirth, dateOfBirth } =
                parsePlaceAndDateOfBirth(value);
              normalized.placeOfBirth = placeOfBirth;
              if (dateOfBirth) normalized.dateOfBirth = dateOfBirth;
            } else if (mappedKey === "nickname") {
              normalized.nickname =
                typeof value === "string"
                  ? toTitleCase(value.trim())
                  : String(value ?? "").trim();
            } else if (mappedKey === "education") {
              normalized.education = normalizeEducation(value);
            } else if (mappedKey === "occupation") {
              normalized.occupation = normalizeOccupation(value);
            } else {
              normalized[mappedKey] = value;
            }
          } else {
            // Fallback: generic camelCase normalisation for non-standard headers
            const camelKey = normalizeKey(rawKey);
            if (camelKey === "education") {
              normalized.education = normalizeEducation(value);
            } else if (camelKey === "occupation") {
              normalized.occupation = normalizeOccupation(value);
            } else if (
              camelKey === "dateOfBirth" ||
              camelKey === "registrationDate"
            ) {
              // When re-importing a failed-rows Excel export, xlsx converts ISO date strings
              // (e.g. "2015-02-23") to Excel serial numbers (e.g. 42058). Parse them back.
              normalized[camelKey] = parseExcelDate(value, fallbackYear);
            } else {
              normalized[camelKey] = value;
            }
          }
        }

        // Ensure unknown state is kept if not provided
        if (!normalized.education) normalized.education = "Unknown";
        if (!normalized.occupation) normalized.occupation = "Unknown";

        // Nickname fallback: use firstName when not explicitly provided
        if (!normalized.nickname && normalized.firstName)
          normalized.nickname = normalized.firstName;

        return { ...normalized, id: `row-${index}`, key: `row-${index}` };
      });

      setPreviewData(dataWithKeys);
      Toast({
        title: "Success",
        description: `File parsed successfully! Found ${dataWithKeys.length} rows.`,
        color: "success",
      });
    } catch (err: unknown) {
      console.error("Error parsing file:", err);
      let errorMessage =
        "Failed to parse file. Please ensure it is a valid Excel or CSV file.";

      if (err instanceof Error && err.name === "NotReadableError") {
        errorMessage =
          "File tidak dapat dibaca. Pastikan file tidak sedang dibuka di aplikasi lain (seperti Excel) dan belum dipindahkan/dihapus.";
      }

      Toast({
        title: "Error",
        description: errorMessage,
        color: "danger",
      });
      setPreviewData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return previewData;
    const lowerQuery = searchQuery.toLowerCase();
    return previewData.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(lowerQuery),
      ),
    );
  }, [previewData, searchQuery]);

  const handlePreviewDataChange = (updated: Record<string, unknown>[]) => {
    if (!searchQuery) {
      setPreviewData(updated);
      return;
    }

    // Merge changes back to main previewData
    // We use the 'key' field to identify rows
    const newPreviewData = [...previewData];

    // 1. Identify which rows were in the filtered view BEFORE the change
    const filteredKeysBefore = new Set(filteredData.map((r) => r.key));

    // 2. Identify which rows are in the updated filtered view AFTER the change
    const updatedKeysAfter = new Set(updated.map((r) => r.key));

    // 3. Rows that were deleted (in before but not in after)
    const deletedKeys = [...filteredKeysBefore].filter(
      (k) => !updatedKeysAfter.has(k),
    );

    // 4. Rows that are new or updated
    // Create a map for faster lookup
    const updatedMap = new Map(updated.map((r) => [r.key, r]));

    let resultData = newPreviewData;

    // Apply deletions
    if (deletedKeys.length > 0) {
      const keysToRemove = new Set(deletedKeys);
      resultData = resultData.filter((r) => !keysToRemove.has(r.key));
    }

    // Apply updates and additions
    const finalData = resultData.map((r) => {
      if (updatedMap.has(r.key)) {
        const updatedRow = updatedMap.get(r.key)!;
        updatedMap.delete(r.key); // mark as handled
        return updatedRow;
      }
      return r;
    });

    // Add remaining items from updatedMap (these are new rows added during search)
    updatedMap.forEach((newRow) => {
      finalData.push(newRow);
    });

    setPreviewData(finalData);
  };

  const handleUpload = async () => {
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
        const { id: _id, key: _key, ...cleanRow } = row;
        return cleanRow;
      });

      const response = await fetch(`/api/import/${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: cleanData,
          createUserAccounts: false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to import data");
      }

      setImportResult(result);

      Toast({
        title: "Import Finished",
        description: result.message || "Import process completed.",
        color: "success",
      });
    } catch (error) {
      console.error(error);
      Toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to import data",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFailedRows = () => {
    if (
      !importResult?.details?.failedRows ||
      importResult.details.failedRows.length === 0
    ) {
      Toast({
        title: "Info",
        description: "No failed rows to download",
        color: "primary",
      });
      return;
    }

    const failedData = importResult.details.failedRows;
    const worksheet = XLSX.utils.json_to_sheet(failedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failed Rows");
    XLSX.writeFile(
      workbook,
      `failed_students_import_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Import Data: {resourceLabel}</Heading>
        <Text className="text-gray-500 dark:text-gray-400">
          Import student data (biodata siswa). Centang opsi di bawah jika ingin
          buat akun user untuk login.
        </Text>
      </div>

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
                    Successful Imports
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
                    Failed Imports
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
                Import More Files
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : !previewData.length ? (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon icon="lucide:upload-cloud" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Heading size="2xl" className="text-md font-semibold">
                Upload File
              </Heading>
              <Text className="text-small text-default-500">
                Choose a file from your computer to preview
              </Text>
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
                        const fileInput = document.getElementById(
                          "file-upload",
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
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
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click to upload or drag & drop
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      XLSX, CSV (Max. 10MB)
                    </Text>
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
              <Button variant="bordered" onPress={() => window.history.back()}>
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
                  <Heading
                    size="2xl"
                    className="text-md font-semibold text-green-800 dark:text-green-200"
                  >
                    File Parsed Successfully
                  </Heading>
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

          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar
                placeholder="Search preview data..."
                onSearch={setSearchQuery}
              />
            </div>
            {searchQuery && (
              <Text className="text-sm text-default-500">
                Found {filteredData.length} of {previewData.length} records
              </Text>
            )}
          </div>

          <FormTable
            title="Data Preview"
            description={`Preview & edit data before import from ${file?.name}`}
            columns={previewColumns}
            data={filteredData as Record<string, unknown>[]}
            onChange={(updated) =>
              handlePreviewDataChange(updated as Record<string, unknown>[])
            }
            enableDelete={true}
            enableAdd={true}
            keyField="key"
          />

          <div className="flex justify-end items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
            <div className="flex gap-3">
              <Button variant="bordered" size="lg" onPress={handleReset}>
                Cancel
              </Button>
              <Button
                color="primary"
                size="lg"
                isLoading={isUploading}
                onPress={handleUpload}
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

      {!previewData.length && !importResult && (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
          <CardBody className="flex flex-row items-start gap-4 p-4">
            <Icon icon="lucide:info" className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex flex-col gap-1">
              <Heading
                size="2xl"
                className="text-sm font-semibold text-blue-700 dark:text-blue-300"
              >
                Need a Template?
              </Heading>
              <Text className="text-sm text-blue-600/80 dark:text-blue-400/80">
                Ensure your file format is correct. You can download an import
                template for {resource} below.
              </Text>
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
    </div>
  );
}
