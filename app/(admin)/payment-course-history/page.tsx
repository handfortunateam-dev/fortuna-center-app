"use client";

import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { apiClient } from "@/lib/axios";
import {
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Chip,
  Skeleton,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { getMonth, getYear } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Features Imports
import { MONTHS, YEARS } from "@/features/finance/payment-history/constants";
import { ClassSummary } from "@/features/finance/payment-history/types";
import { StateMessage } from "@/components/state-message";

export default function PaymentCourseHistoryPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(
    String(getMonth(new Date()) + 1),
  );
  const [selectedYear, setSelectedYear] = useState(String(getYear(new Date())));
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Summary Data
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

  if (isError) {
    return (
      <StateMessage
        icon="solar:danger-circle-bold-duotone"
        title="Failed to load payment data"
        message="Please try again later"
        type="error"
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full overflow-hidden">
      {/* Header section */}
      <div className="space-y-6 pb-6 shrink-0">
        <div>
          <Heading className="text-3xl font-bold">
            Payment Course History
          </Heading>
          <Text className="text-default-500 mt-1">
            Monitor monthly payments across all classes
          </Text>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Heading className="text-xl font-semibold">Select a Class</Heading>
          <div className="flex gap-2 w-full max-w-2xl">
            <Input
              placeholder="Search classes or students..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4" />
              }
              isClearable
              className="flex-1"
            />
            <Select
              label="Month"
              selectedKeys={[selectedMonth]}
              onSelectionChange={(keys) =>
                setSelectedMonth(Array.from(keys)[0] as string)
              }
              className="w-40"
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
              className="w-32"
              size="sm"
            >
              {YEARS.map((y) => (
                <SelectItem key={y.value}>{y.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="h-48 shadow-sm">
                <CardBody className="p-4 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-6 w-3/4 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-1/2 rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
        ) : summaryData?.length === 0 ? (
          <StateMessage
            icon="solar:danger-circle-bold-duotone"
            title="No payment history found"
            message="Please try again later"
            type="empty"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {summaryData?.map((classItem) => {
              const paidCount = classItem.students.filter(
                (s) => s.payment?.status === "paid",
              ).length;
              const unpaidCount = classItem.students.length - paidCount;

              return (
                <Card
                  key={classItem.id}
                  isPressable
                  onPress={() =>
                    router.push(`/payment-course-history/${classItem.id}`)
                  }
                  className="group hover:scale-[1.00] active:scale-[0.98] border-2 border-transparent hover:border-primary transition-all shadow-sm h-full min-h-[200px]"
                >
                  <CardBody className="p-6 flex flex-col items-start gap-4 h-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon icon="solar:bank-note-bold-duotone" width={28} />
                      </div>
                      <div className="flex gap-1">
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          className="font-mono text-[10px]"
                        >
                          {paidCount} Paid
                        </Chip>
                        <Chip
                          size="sm"
                          variant="flat"
                          color="danger"
                          className="font-mono text-[10px]"
                        >
                          {unpaidCount} Unpaid
                        </Chip>
                      </div>
                    </div>

                    <div className="w-full">
                      <Text className="font-bold text-xl leading-tight uppercase tracking-tight line-clamp-1">
                        {classItem.name}
                      </Text>
                      <Text className="text-xs text-default-400 mt-1 font-medium italic">
                        {classItem.code || "N/A"}
                      </Text>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <Text className="text-[10px] uppercase font-bold text-default-400 tracking-wider">
                        Enrolled Students
                      </Text>
                      <Text className="font-bold text-primary">
                        {classItem.students.length} Students
                      </Text>
                    </div>

                    <div className="w-full pt-2 flex justify-end mt-auto">
                      <div className="flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                        <Icon
                          icon="solar:arrow-right-bold-duotone"
                          className="ml-1"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
