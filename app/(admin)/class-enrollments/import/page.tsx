"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ScrollShadow,
  Autocomplete,
  AutocompleteItem,
  Divider,
} from "@heroui/react";
import * as XLSX from "xlsx";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useStudentsLookup, useClassesLookup } from "@/services/lookupService";
import { useQueryClient } from "@tanstack/react-query";
import { classEnrollmentKeys } from "@/services/classesService";

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

interface EnrollmentRow {
  key: string;
  studentId: string;
  classId: string;
}

export default function ImportClassEnrollmentsPage() {
  const resource = "class-enrollments";
  const resourceLabel = "Class Enrollments";

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [mode, setMode] = useState<"choose" | "file" | "manual">("choose");
  const queryClient = useQueryClient();

  const { data: students = [], isLoading: isLoadingStudents } =
    useStudentsLookup();
  const { data: classList = [], isLoading: isLoadingClasses } =
    useClassesLookup();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseFile(selectedFile);
    }
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
          description: "File is empty",
          color: "warning",
        });
        setPreviewData([]);
      } else {
        const dataWithKeys = jsonData.map((row: unknown, index) => {
          const r = row as Record<string, unknown>;
          return { ...r, key: `row-${index}`, id: `row-${index}` };
        });
        setPreviewData(dataWithKeys);
        setMode("file");
      }
    } catch (error) {
      Toast({
        title: "Error",
        description: "Failed to parse file",
        color: "danger",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddRow = () => {
    setEnrollments((prev) => [
      ...prev,
      { key: `manual-${Date.now()}`, studentId: "", classId: "" },
    ]);
  };

  const handleRemoveRow = (key: string) => {
    setEnrollments((prev) => prev.filter((r) => r.key !== key));
  };

  const handleEnrollmentChange = (
    key: string,
    field: "studentId" | "classId",
    value: string,
  ) => {
    setEnrollments((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  };

  const handleUpload = async () => {
    let payload: Record<string, unknown>[];
    if (mode === "file") {
      payload = previewData.map(({ id, key, ...cleanRow }) => cleanRow);
    } else {
      const validRows = enrollments.filter((r) => r.studentId && r.classId);
      if (validRows.length === 0) {
        Toast({
          title: "Error",
          description: "Please complete at least one row",
          color: "danger",
        });
        return;
      }
      payload = validRows.map((r) => ({
        studentId: r.studentId,
        classId: r.classId,
      }));
    }

    setIsUploading(true);
    try {
      const response = await fetch(`/api/import/${resource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      const result = await response.json();
      setImportResult(result);

      // Invalidate queries to refresh the table data
      await queryClient.invalidateQueries({
        queryKey: classEnrollmentKeys.all,
      });
    } catch (error) {
      Toast({ title: "Error", description: "Import failed", color: "danger" });
    } finally {
      setIsUploading(false);
    }
  };

  const tableColumns = useMemo(() => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0])
      .filter((k) => k !== "key" && k !== "id")
      .map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
      }));
  }, [previewData]);

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setEnrollments([]);
    setMode("choose");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Import Data: {resourceLabel}</Heading>
        <Text className="text-gray-500 dark:text-gray-400">
          Enroll students into classes manually or via bulk file upload. Select
          an option below to begin.
        </Text>
      </div>

      {!importResult ? (
        mode === "choose" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              isPressable
              className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-colors"
              onPress={() => {
                setMode("manual");
                handleAddRow();
              }}
            >
              <CardBody className="flex flex-col items-center gap-4 py-12">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Icon icon="lucide:mouse-pointer-click" className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Select Manually</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Select students and classes directly from dropdowns.
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardBody className="flex flex-col items-center gap-4 py-12">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Icon icon="lucide:upload-cloud" className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Upload Excel File</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a spreadsheet with student and class mappings.
                  </p>
                </div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                />
                <Button
                  as="label"
                  htmlFor="file-upload"
                  variant="flat"
                  color="primary"
                  className="cursor-pointer mt-2"
                  startContent={<Icon icon="lucide:file-up" />}
                >
                  Select File
                </Button>
              </CardBody>
            </Card>

            <div className="md:col-span-2">
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
                      You can download an import template which includes valid
                      Student IDs and Class Codes.
                    </p>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      className="w-fit px-0 h-auto min-h-0 mt-1 font-medium"
                      startContent={
                        <Icon icon="lucide:download" className="w-4 h-4" />
                      }
                      onPress={() =>
                        (window.location.href = `/api/template/${resource}`)
                      }
                    >
                      Download {resourceLabel} Template
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        ) : mode === "manual" ? (
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Icon icon="lucide:list-plus" className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-md">Manual Entry</p>
                </div>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={handleAddRow}
                  startContent={<Icon icon="lucide:plus" />}
                >
                  Add Row
                </Button>
              </CardHeader>
              <CardBody className="p-0">
                <ScrollShadow className="max-h-[500px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 px-6">
                    {enrollments.map((row, idx) => (
                      <div
                        key={row.key}
                        className="flex flex-col md:flex-row gap-4 py-4 items-end"
                      >
                        <div className="text-sm font-medium text-gray-400 w-8 mb-[10px]">
                          {idx + 1}.
                        </div>
                        <div className="flex-1 w-full">
                          <Autocomplete
                            label="Student"
                            placeholder="Select student..."
                            isLoading={isLoadingStudents}
                            onSelectionChange={(key) =>
                              handleEnrollmentChange(
                                row.key,
                                "studentId",
                                String(key || ""),
                              )
                            }
                            selectedKey={row.studentId}
                          >
                            {students.map((s) => (
                              <AutocompleteItem
                                key={s.value}
                                textValue={s.text}
                              >
                                {s.text}
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                        </div>
                        <div className="flex-1 w-full">
                          <Autocomplete
                            label="Class"
                            placeholder="Select class..."
                            isLoading={isLoadingClasses}
                            onSelectionChange={(key) =>
                              handleEnrollmentChange(
                                row.key,
                                "classId",
                                String(key || ""),
                              )
                            }
                            selectedKey={row.classId}
                          >
                            {classList.map((c) => (
                              <AutocompleteItem
                                key={c.value}
                                textValue={c.text}
                              >
                                {c.text}
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          className="mb-1"
                          onPress={() => handleRemoveRow(row.key)}
                        >
                          <Icon icon="lucide:trash-2" className="text-lg" />
                        </Button>
                      </div>
                    ))}
                    {enrollments.length === 0 && (
                      <div className="py-12 text-center text-gray-500">
                        No rows added. Click &quot;Add Row&quot; to begin.
                      </div>
                    )}
                  </div>
                </ScrollShadow>
              </CardBody>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <Button variant="bordered" onPress={handleReset}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isUploading}
                  onPress={handleUpload}
                  startContent={
                    !isUploading && <Icon icon="lucide:check-circle" />
                  }
                >
                  Confirm Enrollments (
                  {enrollments.filter((r) => r.studentId && r.classId).length})
                </Button>
              </div>
            </Card>
          </div>
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
                  size="sm"
                  onPress={handleReset}
                  startContent={<Icon icon="lucide:x" />}
                >
                  Cancel / Re-upload
                </Button>
              </CardBody>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-md">Data Preview</p>
                <p className="text-xs text-gray-500">
                  Review the extracted data before committing the import.
                </p>
              </CardHeader>
              <ScrollShadow className="max-h-[500px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 uppercase text-xs text-gray-500 font-bold sticky top-0 z-10">
                    <tr>
                      {tableColumns.map((col) => (
                        <th key={col.key} className="px-6 py-3">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {previewData.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        {tableColumns.map((col) => (
                          <td
                            key={col.key}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300"
                          >
                            {String(item[col.key] || "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollShadow>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <Button variant="bordered" onPress={handleReset}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isUploading}
                  onPress={handleUpload}
                  startContent={
                    !isUploading && <Icon icon="lucide:check-circle" />
                  }
                >
                  Confirm Import
                </Button>
              </div>
            </Card>
          </div>
        )
      ) : (
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
          <CardBody className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-xl text-center">
                <p className="text-xs font-bold text-green-600 uppercase">
                  Success
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {importResult.details?.success || 0}
                </p>
              </div>
              <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-xl text-center">
                <p className="text-xs font-bold text-red-600 uppercase">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {importResult.details?.failed || 0}
                </p>
              </div>
            </div>
            {importResult.details?.errors &&
              importResult.details.errors.length > 0 && (
                <ScrollShadow className="max-h-48 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    {importResult.details.errors.map((err, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-red-500">•</span> {err}
                      </li>
                    ))}
                  </ul>
                </ScrollShadow>
              )}
            <div className="flex justify-end pt-2 gap-3">
              <Button variant="bordered" onPress={() => window.history.back()}>
                Return to List
              </Button>
              <Button color="primary" onPress={handleReset}>
                Import More
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
