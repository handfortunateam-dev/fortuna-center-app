"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Toast } from "@/components/toast";
import { apiClient } from "@/lib/axios";
import { getMonth, getYear, format } from "date-fns";
import * as XLSX from "xlsx";
import { PaymentModal } from "@/features/finance/payment-history/components/PaymentModal";
import { MONTHS, YEARS } from "@/features/finance/payment-history/constants";
import {
  ClassSummary,
  StudentPaymentInfo,
} from "@/features/finance/payment-history/types";

export default function ClassPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const queryClient = useQueryClient();

  const [selectedMonth, setSelectedMonth] = useState(
    String(getMonth(new Date()) + 1),
  );
  const [selectedYear, setSelectedYear] = useState(String(getYear(new Date())));
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Payment Data for this specific class
  const {
    data: summaryData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-summary", selectedMonth, selectedYear, searchQuery],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: ClassSummary[];
      }>("/course-payments/summary", {
        params: {
          month: selectedMonth,
          year: selectedYear,
          search: searchQuery,
        },
      });
      return res.data.data;
    },
  });

  // Find the specific class in the summary data
  const classItem = useMemo(() => {
    return summaryData?.find((c) => c.id === classId);
  }, [summaryData, classId]);

  // Modal State
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [paymentTarget, setPaymentTarget] = useState<{
    student: StudentPaymentInfo;
    classItem: ClassSummary;
  } | null>(null);

  const payMutation = useMutation({
    mutationFn: async ({
      amount,
      paidAt,
    }: {
      amount: number;
      paidAt: string;
    }) => {
      if (!paymentTarget) return;

      const payload = {
        studentId: paymentTarget.student.id,
        classId: paymentTarget.classItem.id,
        month: Number(selectedMonth),
        year: Number(selectedYear),
        amount,
        status: "paid",
        paidAt: new Date(paidAt),
        notes: "Quick Payment",
      };

      await apiClient.post("/course-payments", payload);
    },
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Payment recorded successfully",
        color: "success",
      });
      queryClient.invalidateQueries({
        queryKey: ["payment-summary"],
      });
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (err as { message?: string }).message ||
        "Failed to create payment";
      Toast({
        title: "Error",
        description: msg,
        color: "danger",
      });
    },
  });

  const handlePay = (student: StudentPaymentInfo, classItem: ClassSummary) => {
    setPaymentTarget({ student, classItem });
    onOpen();
  };

  const handleConfirmPayment = (amount: number, paidAt: string) => {
    payMutation.mutate({ amount, paidAt });
  };

  const handleExportToExcel = () => {
    if (!classItem || classItem.students.length === 0) {
      Toast({
        title: "No data to export",
        description: "There are no student payment records to export.",
        color: "warning",
      });
      return;
    }

    const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label;

    const exportData = classItem.students.map((student) => ({
      Class: classItem.name,
      Period: `${monthLabel} ${selectedYear}`,
      "Student ID": student.studentId,
      Name: student.name,
      Email: student.email,
      Phone: student.phone || "-",
      Status: student.payment?.status === "paid" ? "Paid" : "Unpaid",
      "Amount Paid": student.payment?.amount || 0,
      "Paid Date": student.payment?.paidAt
        ? format(new Date(student.payment.paidAt), "dd MMM yyyy")
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    const fileName = `Payments_${classItem.name.replace(/\s+/g, "_")}_${monthLabel}_${selectedYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    Toast({
      title: "Export Success",
      description: `Payment data exported to ${fileName}`,
      color: "success",
    });
  };

  if (isError) {
    return (
      <div className="text-center py-10 text-danger">
        <Icon icon="lucide:alert-circle" className="w-10 h-10 mx-auto mb-2" />
        <p>Failed to load payment data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Heading className="text-3xl font-bold">
            {classItem?.name || "Class"} Payment
          </Heading>
          <Text className="text-default-500 mt-1">
            Monitoring payments for{" "}
            {MONTHS.find((m) => m.value === selectedMonth)?.label}{" "}
            {selectedYear}
          </Text>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            color="success"
            onPress={handleExportToExcel}
            startContent={
              <Icon icon="solar:file-download-bold-duotone" width={18} />
            }
          >
            Export to Excel
          </Button>
          <Button
            variant="flat"
            color="primary"
            onPress={() => router.push("/payment-course-history")}
            startContent={
              <Icon icon="solar:arrow-left-bold-duotone" width={18} />
            }
          >
            Back to History
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search student name..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
              }
              isClearable
              onClear={() => setSearchQuery("")}
            />
            <Select
              label="Month"
              selectedKeys={[selectedMonth]}
              onSelectionChange={(keys) =>
                setSelectedMonth(Array.from(keys)[0] as string)
              }
              size="sm"
            >
              {MONTHS.map((m) => (
                <SelectItem key={m.value}>{m.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Year"
              selectedKeys={[selectedYear]}
              onSelectionChange={(keys) =>
                setSelectedYear(Array.from(keys)[0] as string)
              }
              size="sm"
            >
              {YEARS.map((y) => (
                <SelectItem key={y.value}>{y.label}</SelectItem>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Student Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="bg-default-50 px-6 py-4 border-b border-divider flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:users-group-rounded-bold-duotone"
              className="text-primary w-5 h-5"
            />
            <Heading className="text-lg font-semibold">Student List</Heading>
          </div>
          {classItem && (
            <div className="flex gap-2">
              <Chip size="sm" variant="flat" color="success">
                {
                  classItem.students.filter((s) => s.payment?.status === "paid")
                    .length
                }{" "}
                Paid
              </Chip>
              <Chip size="sm" variant="flat" color="danger">
                {
                  classItem.students.filter(
                    (s) => !s.payment || s.payment.status === "unpaid",
                  ).length
                }{" "}
                Unpaid
              </Chip>
            </div>
          )}
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !classItem || classItem.students.length === 0 ? (
            <div className="p-10 text-center text-default-400">
              <p>No students found for this class in selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-default-500 uppercase bg-default-50/50 border-b border-divider">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Student Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Phone</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Paid Date</th>
                    <th className="px-6 py-3 font-semibold text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {classItem.students.map((student) => {
                    const isPaid = student.payment?.status === "paid";
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-default-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-default-900">
                          {student.name}{" "}
                          <span className="text-default-400 font-normal">
                            ({student.studentId})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-default-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 text-default-500">
                          {student.phone || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <Chip
                            color={isPaid ? "success" : "danger"}
                            variant="flat"
                            size="sm"
                            startContent={
                              <Icon
                                icon={
                                  isPaid
                                    ? "solar:check-circle-bold-duotone"
                                    : "solar:close-circle-bold-duotone"
                                }
                                className="w-3 h-3 ml-1"
                              />
                            }
                          >
                            {isPaid ? "Paid" : "Unpaid"}
                          </Chip>
                        </td>
                        <td className="px-6 py-4 text-default-500">
                          {student.payment?.paidAt
                            ? new Date(
                                student.payment.paidAt,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isPaid ? (
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              startContent={
                                <Icon icon="solar:card-transfer-bold-duotone" />
                              }
                              onPress={() => handlePay(student, classItem)}
                            >
                              Pay Now
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="light"
                              isDisabled
                              className="text-default-400"
                            >
                              Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pay Now Modal */}
      <PaymentModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        target={paymentTarget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        isLoading={payMutation.isPending}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
