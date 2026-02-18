"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query"; // Fixed import source
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, CardFooter } from "@heroui/react";
import { apiClient } from "@/lib/axios";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextInput } from "@/components/inputs/TextInput";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput"; // Path check
import { Heading } from "@/components/heading";
import { Toast } from "@/components/toast";
import { Text } from "@/components/text";

const MONTHS = [
  { label: "January", value: "1" },
  { label: "February", value: "2" },
  { label: "March", value: "3" },
  { label: "April", value: "4" },
  { label: "May", value: "5" },
  { label: "June", value: "6" },
  { label: "July", value: "7" },
  { label: "August", value: "8" },
  { label: "September", value: "9" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];

export default function CreatePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formMethods = useForm({
    defaultValues: {
      studentId: searchParams.get("studentId") || "",
      classId: searchParams.get("classId") || "",
      month: searchParams.get("month") || String(new Date().getMonth() + 1),
      year: Number(searchParams.get("year")) || new Date().getFullYear(),
      amount: 300000,
      status: "paid", // Default to paid if coming from "Pay Now"
      paidAt: new Date().toISOString().split("T")[0], // Default today
      notes: "",
    },
  });

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students-options"],
    queryFn: async () => {
      const res = await apiClient.get("/students");
      return (res.data.data || []).map((s: any) => ({
        label: `${s.firstName} ${s.lastName}`,
        value: s.id,
      }));
    },
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes-options"],
    queryFn: async () => {
      const res = await apiClient.get("/classes");
      return (res.data.data || []).map((c: any) => ({
        label: c.name,
        value: c.id,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post("/course-payments", data),
    onSuccess: () => {
      Toast({
        title: "Success",
        description: "Payment recorded successfully",
        color: "success",
      });
      router.push("/payment-course-history");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create payment";
      Toast({
        title: "Error",
        description: msg,
        color: "danger",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Format numeric values
    const payload = {
      ...data,
      month: Number(data.month),
      year: Number(data.year),
      amount: Number(data.amount),
      paidAt: data.status === "paid" && data.paidAt ? data.paidAt : null,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Heading size="2xl">Record New Payment</Heading>
        <Text className="text-default-500">
          Record a monthly course payment for a student.
        </Text>
      </div>

      <Card>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <CardBody className="gap-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  name="studentId"
                  label="Student"
                  placeholder="Select student"
                  options={students}
                  required
                  isLoading={isLoadingStudents}
                />
                <SelectInput
                  name="classId"
                  label="Class"
                  placeholder="Select class"
                  options={classes}
                  required
                  disabled={isLoadingClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput
                  name="month"
                  label="Month"
                  placeholder="Select Month"
                  options={MONTHS}
                  required
                />
                <TextInput name="year" label="Year" type="number" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  name="amount"
                  label="Amount (IDR)"
                  type="number"
                  placeholder="e.g. 300000"
                  required
                />
                <SelectInput
                  name="status"
                  label="Status"
                  options={[
                    { label: "Unpaid", value: "unpaid" },
                    { label: "Paid", value: "paid" },
                  ]}
                  required
                />
              </div>

              {formMethods.watch("status") === "paid" && (
                <TextInput
                  name="paidAt"
                  label="Payment Date"
                  type="date"
                  required
                  description="When was the payment received?"
                />
              )}

              <TextInput
                name="notes"
                label="Notes (Optional)"
                placeholder="e.g. transfer BCA"
              />
            </CardBody>
            <CardFooter className="justify-end gap-3 px-6 pb-6 pt-0">
              <Button variant="flat" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createMutation.isPending}
              >
                Save Payment
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
