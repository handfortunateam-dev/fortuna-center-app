"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Input,
  Select,
  SelectItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Toast } from "@/components/toast";
import { Icon } from "@iconify/react";
import { apiClient } from "@/lib/axios";
import { getMonth, getYear } from "date-fns";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { SkeletonTable } from "@/components/skeletons/SkeletonTable";
import { useRouter } from "next/navigation";

// Features Imports
import { ClassPaymentCard } from "@/features/finance/payment-history/components/ClassPaymentCard";
import { PaymentModal } from "@/features/finance/payment-history/components/PaymentModal";
import { MONTHS, YEARS } from "@/features/finance/payment-history/constants";
import {
  ClassSummary,
  StudentPaymentInfo,
} from "@/features/finance/payment-history/types";

export default function PaymentCourseHistoryPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(
    String(getMonth(new Date()) + 1),
  );
  const [selectedYear, setSelectedYear] = useState(String(getYear(new Date())));
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Data
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

  // Modal State
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [paymentTarget, setPaymentTarget] = useState<{
    student: StudentPaymentInfo;
    classItem: ClassSummary;
  } | null>(null);

  const queryClient = useQueryClient();

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Heading size="2xl">Payment Course History</Heading>
          <Text className="text-default-500">
            Monitor monthly payments per class
          </Text>
        </div>
      </div>

      {/* Filters Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search student name..."
            startContent={
              <Icon icon="lucide:search" className="text-default-400" />
            }
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex-1"
            size="sm"
            isClearable
          />
          <div className="flex gap-2 min-w-[300px]">
            <Select
              label="Month"
              placeholder="Select Month"
              value={selectedMonth}
              selectedKeys={[selectedMonth]}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1"
              size="sm"
            >
              {MONTHS.map((m) => (
                <SelectItem key={m.value}>{m.label}</SelectItem>
              ))}
            </Select>
            <Select
              label="Year"
              placeholder="Select Year"
              value={selectedYear}
              selectedKeys={[selectedYear]}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-32"
              size="sm"
            >
              {YEARS.map((y) => (
                <SelectItem key={y.value}>{y.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      {isLoading ? (
        <div className="space-y-6">
          <SkeletonTable rows={3} columns={3} />
          <SkeletonTable rows={3} columns={3} />
        </div>
      ) : isError ? (
        <div className="text-center py-10 text-danger">
          <Icon icon="lucide:alert-circle" className="w-10 h-10 mx-auto mb-2" />
          <p>Failed to load payment data</p>
        </div>
      ) : summaryData?.length === 0 ? (
        <div className="text-center py-10 text-default-400">
          <p>No classes or students found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {summaryData?.map((classItem) => (
            <ClassPaymentCard
              key={classItem.id}
              classItem={classItem}
              onPay={handlePay}
            />
          ))}
        </div>
      )}

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
