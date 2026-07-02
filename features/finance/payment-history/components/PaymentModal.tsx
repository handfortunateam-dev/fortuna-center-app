import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useForm, FormProvider } from "react-hook-form";
import { ClassSummary, StudentPaymentInfo } from "../types";
import { MONTHS } from "../constants";
import { MoneyInput, DatePickerInput } from "@/components/inputs";

interface PaymentFormValues {
  amount: number;
  paidAt: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  target: {
    student: StudentPaymentInfo;
    classItem: ClassSummary;
  } | null;
  selectedMonth: string;
  selectedYear: string;
  isLoading: boolean;
  onConfirm: (amount: number, paidAt: string) => void;
}

export function PaymentModal({
  isOpen,
  onOpenChange,
  onClose,
  target,
  selectedMonth,
  selectedYear,
  isLoading,
  onConfirm,
}: PaymentModalProps) {
  const methods = useForm<PaymentFormValues>({
    defaultValues: {
      amount: 300000,
      paidAt: new Date().toISOString().split("T")[0],
    },
  });

  const { reset, handleSubmit } = methods;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        amount: 300000,
        paidAt: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen, target, reset]);

  const onSubmit = (data: PaymentFormValues) => {
    onConfirm(data.amount, data.paidAt);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <FormProvider {...methods}>
            <ModalHeader className="flex flex-col gap-1">
              Pay for {target?.student.name}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 p-3 bg-default-100 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-default-500">Class:</span>
                    <span className="font-medium">
                      {target?.classItem.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-500">Period:</span>
                    <span className="font-medium">
                      {MONTHS.find((m) => m.value === selectedMonth)?.label}{" "}
                      {selectedYear}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-500">Student:</span>
                    <span className="font-medium">
                      {target?.student.name} ({target?.student.studentId})
                    </span>
                  </div>
                </div>

                <MoneyInput
                  name="amount"
                  label="Payment Amount"
                  placeholder="Enter amount"
                  required
                  rules={{
                    required: "Amount is required",
                    min: { value: 1, message: "Amount must be greater than 0" },
                  }}
                />

                <DatePickerInput
                  name="paidAt"
                  label="Payment Date"
                  placeholder="Select date"
                  required
                  rules={{ required: "Date is required" }}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={() => handleSubmit(onSubmit)()}
                isLoading={isLoading}
              >
                Confirm Payment
              </Button>
            </ModalFooter>
          </FormProvider>
        )}
      </ModalContent>
    </Modal>
  );
}
