"use client";

import { Heading } from "@/components/heading";
import { FormTable } from "@/components/table/FormTable";
import { Text } from "@/components/text";
import { Toast } from "@/components/toast";
import { previewColumnsTeachers } from "@/features/lms/teachers/import/previewColumnsTeachers";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
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

export default function ImportTeachersPage() {
  const resource = "teachers";
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [createUserAccounts, setCreateUserAccounts] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const resourceLabel = "Teachers";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
    }
  };

  /**
   * Normalisasi key dari Excel header ke camelCase:
   * "First Name"    → "firstName"
   * "Date of Birth" → "dateOfBirth"
   * "first_name"    → "firstName"
   * "firstName"     → "firstName"  (sudah benar, tidak diubah)
   */
  const normalizeKey = (str: string): string => {
    if (!/[\s_]/.test(str)) {
      // Tidak ada spasi/underscore → pastikan huruf pertama lowercase
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str
      .toLowerCase()
      .replace(/[\s_]+(.)/g, (_, char: string) => char.toUpperCase());
  };

  /**
   * Map shorthand education values (e.g. from old Excel templates)
   * ke nilai valid di EDUCATION_LEVELS.
   */
  const EDUCATION_VALUE_MAP: Record<string, string> = {
    SD: "Elementary School",
    SMP: "Junior High School",
    SMA: "Senior High School",
    SMK: "Senior High School",
    D1: "Diploma 1",
    D2: "Diploma 2",
    D3: "Diploma 3",
    D4: "Diploma 4",
    S1: "Bachelor's Degree",
    S2: "Master's Degree",
    S3: "Doctoral Degree",
    "BACHELOR'S DEGREE": "Bachelor's Degree",
    "MASTER'S DEGREE": "Master's Degree",
    "DOCTORAL DEGREE": "Doctoral Degree",
    "ELEMENTARY SCHOOL": "Elementary School",
    "JUNIOR HIGH SCHOOL": "Junior High School",
    "SENIOR HIGH SCHOOL": "Senior High School",
    "DIPLOMA 1": "Diploma 1",
    "DIPLOMA 2": "Diploma 2",
    "DIPLOMA 3": "Diploma 3",
    "DIPLOMA 4": "Diploma 4",
  };

  const normalizeEducation = (value: unknown): string => {
    if (!value || typeof value !== "string") return "";
    const upper = value.trim().toUpperCase();
    return EDUCATION_VALUE_MAP[upper] ?? value.trim();
  };

  const parseFile = async (file: File) => {
    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
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

          // Remap semua key dari format Excel header → camelCase
          const normalized: Record<string, unknown> = {};
          for (const [rawKey, value] of Object.entries(r)) {
            normalized[normalizeKey(rawKey)] = value;
          }

          // Normalize education value ke nilai valid EDUCATION_LEVELS
          if ("education" in normalized) {
            normalized.education = normalizeEducation(normalized.education);
          }

          return {
            ...normalized,
            id: `row-${index}`,
            key: `row-${index}`,
          };
        });
        setPreviewData(dataWithKeys);
        Toast({
          title: "Success",
          description: `File parsed successfully! Found ${dataWithKeys.length} rows.`,
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      Toast({
        title: "Error",
        description:
          "Failed to parse file. Please ensure it is a valid Excel or CSV file.",
        color: "danger",
      });
      setPreviewData([]);
    } finally {
      setIsParsing(false);
    }
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
        const { id, key, _originalItem, ...cleanRow } = row;
        return cleanRow;
      });

      const response = await fetch(`/api/import/${resource}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: cleanData,
          createUserAccounts: createUserAccounts,
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
      `failed_teachers_import_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setCreateUserAccounts(true);
    const fileInput = document.getElementById(
      "file-upload",
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Import Data: {resourceLabel}</Heading>
        <Text className="text-gray-500 dark:text-gray-400">
          Import teacher accounts (akun guru untuk login sistem). Password wajib
          diisi.
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
                  <Text className="text-sm font-medium text-gray-500">
                    Processing file...
                  </Text>
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

          <FormTable
            title="Data Preview"
            description={`Preview & edit data before import from ${file?.name}`}
            columns={previewColumnsTeachers}
            data={previewData as Record<string, unknown>[]}
            onChange={(updated) =>
              setPreviewData(updated as Record<string, unknown>[])
            }
            enableDelete={true}
            enableAdd={true}
            keyField="key"
          />

          <div className="flex justify-between items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
            <Checkbox
              isSelected={createUserAccounts}
              onValueChange={setCreateUserAccounts}
              color="primary"
            >
              <span className="text-sm font-medium">
                Create user accounts as well (for system login) - password is
                required
              </span>
            </Checkbox>
            <div className="flex gap-3 ml-auto">
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
