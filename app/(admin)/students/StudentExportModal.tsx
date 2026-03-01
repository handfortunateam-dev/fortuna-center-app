"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { Toast } from "@/components/toast";
import ExcelJS from "exceljs";
import { Icon } from "@iconify/react";
import { Text } from "@/components/text";

interface StudentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ensure strict typing for map
interface StudentRecord {
  studentNumber: number;
  studentId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  nickname?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  registrationDate?: string | null;
  placeOfBirth?: string | null;
  dateOfBirth?: string | null;
  education?: string | null;
  occupation?: string | null;
  status: string;
}

export function StudentExportModal({
  isOpen,
  onClose,
}: StudentExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [limit, setLimit] = useState<string>("500");
  const [year, setYear] = useState<string>("all");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 46 }, (_, i) => String(currentYear - i));

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();
      params.append("limit", limit);
      params.append("year", year);

      const res = await fetch(
        `/api/students/custom-export?${params.toString()}`,
      );
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch data for export");
      }

      const data: StudentRecord[] = json.data;

      if (!data || data.length === 0) {
        Toast({
          title: "No Data",
          description: "No students found matching your criteria.",
          color: "warning",
        });
        setIsExporting(false);
        return;
      }

      // Create a workbook with ExcelJS for better styling
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Students Data");

      // Define columns without Student Number and Student ID
      worksheet.columns = [
        { header: "First Name", key: "firstName", width: 20 },
        { header: "Middle Name", key: "middleName", width: 20 },
        { header: "Last Name", key: "lastName", width: 20 },
        { header: "Nickname", key: "nickname", width: 15 },
        { header: "Gender", key: "gender", width: 15 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "Registration Date", key: "registrationDate", width: 20 },
        { header: "Place of Birth", key: "placeOfBirth", width: 20 },
        { header: "Date of Birth", key: "dateOfBirth", width: 20 },
        { header: "Education", key: "education", width: 20 },
        { header: "Occupation", key: "occupation", width: 20 },
        { header: "Status", key: "status", width: 15 },
      ];

      // Style header
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F81BD" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // Add data
      data.forEach((student) => {
        worksheet.addRow({
          firstName: student.firstName,
          middleName: student.middleName || "",
          lastName: student.lastName,
          nickname: student.nickname || "",
          gender: student.gender,
          email: student.email || "",
          phone: student.phone || "",
          registrationDate: student.registrationDate,
          placeOfBirth: student.placeOfBirth || "",
          dateOfBirth: student.dateOfBirth || "",
          education: student.education || "",
          occupation: student.occupation || "",
          status: student.status,
        });
      });

      // Add borders to all cells
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Generate buffer
      const excelBuffer = await workbook.xlsx.writeBuffer();

      // Saving the file
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Exported_Students_${year}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Toast({
        title: "Export Successful",
        description: `Successfully exported ${data.length} student records.`,
        color: "success",
      });

      onClose();
    } catch (error) {
      console.error(error);
      Toast({
        title: "Export Failed",
        description:
          (error as Error).message || "An error occurred while exporting.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Custom Data Export
              <Text className="text-sm text-default-500 font-normal">
                Export student records handling large datasets (up to 10k+) by
                filtering exactly what you need.
              </Text>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4 py-2">
                <Autocomplete
                  label="Registration Year"
                  labelPlacement="outside-top"
                  description="Filter students based on the year they registered."
                  selectedKey={year}
                  onSelectionChange={(key) => setYear(key as string)}
                >
                  {[...years.map((y) => ({ key: y, label: y }))].map((item) => (
                    <AutocompleteItem key={item.key}>
                      {item.label}
                    </AutocompleteItem>
                  ))}
                </Autocomplete>

                <Autocomplete
                  label="Data Limit"
                  labelPlacement="outside-top"
                  description="Limit the number of records returned to avoid crashing."
                  selectedKey={limit}
                  onSelectionChange={(key) => setLimit(key as string)}
                >
                  <AutocompleteItem key="100">100 Records</AutocompleteItem>
                  <AutocompleteItem key="500">500 Records</AutocompleteItem>
                  <AutocompleteItem key="1000">1,000 Records</AutocompleteItem>
                  <AutocompleteItem key="5000">5,000 Records</AutocompleteItem>
                  <AutocompleteItem key="all">
                    All Records (Warning: Massive data)
                  </AutocompleteItem>
                </Autocomplete>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isExporting}
              >
                Close
              </Button>
              <Button
                color="primary"
                startContent={<Icon icon="lucide:download" />}
                onPress={handleExport}
                isLoading={isExporting}
              >
                Export to Excel
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
