"use client";

import { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ScrollShadow,
} from "@heroui/react";
import * as XLSX from "xlsx";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    success: number;
    failed: number;
    errors: string[];
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface ClassItem {
  id: string;
  name: string;
  code: string;
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

  const [students, setStudents] = useState<Student[]>([]);
  const [classList, setClassList] = useState<ClassItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [mode, setMode] = useState<"choose" | "file" | "manual">("choose");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [studentRes, classRes] = await Promise.all([
          fetch("/api/users?source=db&limit=1000&role=STUDENT"),
          fetch("/api/classes"),
        ]);
        const studentData = await studentRes.json();
        const classData = await classRes.json();

        if (studentData.success && Array.isArray(studentData.data)) {
          setStudents(
            studentData.data.map((s: Record<string, string>) => ({
              id: s.id,
              name: s.name || s.fullName || "",
              email: s.email || "",
            })),
          );
        }
        if (classData.success && Array.isArray(classData.data)) {
          setClassList(
            classData.data.map((c: Record<string, string>) => ({
              id: c.id,
              name: c.name || "",
              code: c.code || "",
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        Toast({
          title: "Error",
          description: "Failed to load students and classes data.",
          color: "warning",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
          description: "File is empty or could not be parsed",
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
        description: "Failed to parse file.",
        color: "danger",
      });
      setPreviewData([]);
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
      if (!file || previewData.length === 0) {
        Toast({ title: "Error", description: "No data to import", color: "danger" });
        return;
      }
      payload = previewData.map((row) => {
        const { id, key, ...cleanRow } = row;
        return cleanRow;
      });
    } else {
      const validRows = enrollments.filter((r) => r.studentId && r.classId);
      if (validRows.length === 0) {
        Toast({
          title: "Error",
          description: "No valid enrollments. Please select both Student and Class.",
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
        description: error instanceof Error ? error.message : "Failed to import data",
        color: "danger",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const tableColumns = useMemo(() => {
    if (previewData.length === 0) return [];
    const keys = Object.keys(previewData[0]).filter(
      (k) => k !== "key" && k !== "id",
    );
    return keys.map((key) => ({
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
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="p-6 max-w-[95%] mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Import Data: {resourceLabel}</Heading>
        <p className="text-gray-500 dark:text-gray-400">
          Daftarkan siswa ke kelas. Pilih dari dropdown atau upload file template Excel.
        </p>
      </div>

      {importResult ? (
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="flex gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon icon="lucide:clipboard-check" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <p className="text-md font-semibold">Import Results</p>
              <p className="text-small text-default-500">{importResult.message}</p>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-8 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 border rounded-xl border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full text-green-700 dark:text-green-300">
                  <Icon icon="lucide:check" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful</p>
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
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {importResult.details?.failed || 0}
                  </p>
                </div>
              </div>
            </div>

            {importResult.details?.errors && importResult.details.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" className="w-4 h-4" />
                  Error Details:
                </p>
                <ScrollShadow className="w-full h-[200px] rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                  <ul className="space-y-2">
                    {importResult.details.errors.map((err, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
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
                Import More
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : mode === "choose" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              isPressable
              onPress={() => {
                setMode("manual");
                setEnrollments([{ key: `manual-${Date.now()}`, studentId: "", classId: "" }]);
              }}
              className="border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-colors"
            >
              <CardBody className="flex flex-col items-center gap-4 p-8">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Icon icon="lucide:mouse-pointer-click" className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Pilih dari Dropdown</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pilih student dan class langsung dari dropdown
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
              <CardBody className="flex flex-col items-center gap-4 p-8">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Icon icon="lucide:upload-cloud" className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">Upload File Excel</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload template Excel yang sudah diisi
                  </p>
                </div>
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
                    <p className="text-sm font-medium">{file.name}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => {
                          setFile(null);
                          const fi = document.getElementById("file-upload") as HTMLInputElement;
                          if (fi) fi.value = "";
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={() => parseFile(file)}
                        isLoading={isParsing}
                      >
                        Process File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    as="label"
                    htmlFor="file-upload"
                    color="primary"
                    variant="flat"
                    className="cursor-pointer"
                  >
                    Select File
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>

          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
            <CardBody className="flex flex-row items-start gap-4 p-4">
              <Icon icon="lucide:info" className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Download Template
                </h4>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  Template sudah berisi dropdown Student dan Class dari database.
                </p>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  className="w-fit px-0 h-auto min-h-0 mt-1 font-medium"
                  startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
                  onPress={() => {
                    window.location.href = `/api/template/${resource}`;
                  }}
                >
                  Download Template
                </Button>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end">
            <Button variant="bordered" onPress={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </div>
      ) : mode === "manual" ? (
        <div className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="flex gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Icon icon="lucide:list-plus" className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-md font-semibold">Enroll Students to Classes</p>
                <p className="text-small text-default-500">
                  Pilih student dan class dari dropdown
                </p>
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
            <CardBody className="px-6 py-4 gap-4">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-gray-500">Loading students & classes...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollments.map((row, index) => (
                    <div
                      key={row.key}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-400 w-8">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Student</label>
                        <select
                          value={row.studentId}
                          onChange={(e) =>
                            handleEnrollmentChange(row.key, "studentId", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">-- Select Student --</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Class</label>
                        <select
                          value={row.classId}
                          onChange={(e) =>
                            handleEnrollmentChange(row.key, "classId", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">-- Select Class --</option>
                          {classList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        className="mt-5"
                        onPress={() => handleRemoveRow(row.key)}
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {enrollments.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Icon icon="lucide:inbox" className="w-10 h-10 mx-auto mb-2" />
                      <p>No rows. Click "Add Row" to start.</p>
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          <div className="flex justify-end items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
            <Button variant="bordered" size="lg" onPress={handleReset}>
              Cancel
            </Button>
            <Button
              color="primary"
              size="lg"
              isLoading={isUploading}
              onPress={handleUpload}
              startContent={!isUploading && <Icon icon="lucide:check-circle" />}
            >
              Confirm Import ({enrollments.filter((r) => r.studentId && r.classId).length} enrollments)
            </Button>
          </div>
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
                onPress={handleReset}
                startContent={<Icon icon="lucide:x" />}
              >
                Cancel / Re-upload
              </Button>
            </CardBody>
          </Card>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold">Preview Data</h3>
              <p className="text-sm text-gray-500">Review data sebelum import.</p>
            </div>
            <ScrollShadow className="max-h-[500px] w-full">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item) => (
                    <tr
                      key={String(item.key)}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      {tableColumns.map((column) => (
                        <td
                          key={column.key}
                          className="px-4 py-3 text-gray-900 dark:text-gray-100"
                        >
                          {typeof item[column.key] === "object"
                            ? JSON.stringify(item[column.key])
                            : String(item[column.key] || "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollShadow>
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm sticky bottom-4 z-20">
            <Button variant="bordered" size="lg" onPress={handleReset}>
              Cancel
            </Button>
            <Button
              color="primary"
              size="lg"
              isLoading={isUploading}
              onPress={handleUpload}
              startContent={!isUploading && <Icon icon="lucide:check-circle" />}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
