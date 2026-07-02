"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useClasses } from "@/services/classesService";
import { ClassItem } from "@/features/lms/classes/interfaces";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { IStudent } from "./interface";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: IStudent | null;
}

export default function PromotionModal({
  isOpen,
  onClose,
  student,
}: PromotionModalProps) {
  const [targetClassId, setTargetClassId] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch active classes for selection
  const { data: classesResponse, isLoading: isLoadingClasses } = useClasses({
    // You might want to filter classes here if your API supports it
  });

  const classes = classesResponse?.data || [];

  const handlePromote = async () => {
    if (!student || !targetClassId) return;

    setIsPromoting(true);
    try {
      const response = await apiClient.post(`/students/${student.id}/promote`, {
        classId: targetClassId,
      });

      if (response.data.success) {
        Toast({
          title: "Promotion Success",
          description: `Student ${student.firstName} has been promoted.`,
          color: "success",
        });

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["/students"] });
        queryClient.invalidateQueries({
          queryKey: [`/students/${student.id}`],
        });

        onClose();
        setTargetClassId("");
      } else {
        throw new Error(response.data.message || "Failed to promote student");
      }
    } catch (error) {
      console.error("Promotion error:", error);
      Toast({
        title: "Promotion Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        color: "danger",
      });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:round-transfer-vertical-bold"
              className="text-2xl text-primary"
            />
            <span>Promote Student (Naik Kelas)</span>
          </div>
        </ModalHeader>
        <ModalBody>
          {student && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-default-50 border border-default-200">
                <p className="text-sm text-default-500">Student</p>
                <p className="text-lg font-bold">
                  {[student.firstName, student.middleName, student.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <p className="text-xs text-default-400">
                  ID: {student.studentId}
                </p>
                {student.currentLevel && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Current Level: {student.currentLevel}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Select Target Class
                </label>
                <Select
                  placeholder="Choose a class to promote to"
                  selectedKeys={targetClassId ? [targetClassId] : []}
                  onSelectionChange={(keys) =>
                    setTargetClassId(Array.from(keys)[0] as string)
                  }
                  isLoading={isLoadingClasses}
                  variant="bordered"
                  classNames={{
                    trigger: "rounded-xl",
                  }}
                  items={classes}
                >
                  {(cls: ClassItem) => (
                    <SelectItem
                      key={cls.id}
                      textValue={`${cls.name} (${cls.level || "No Level"})`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{cls.name}</span>
                        <span className="text-xs text-default-400">
                          Level: {cls.level || "Unspecified"}
                        </span>
                      </div>
                    </SelectItem>
                  )}
                </Select>
                <p className="text-[10px] text-default-400 px-1 italic">
                  Note: Promoting will mark the current active enrollment as
                  completed and create a new enrollment in the selected class.
                </p>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={isPromoting}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handlePromote}
            isLoading={isPromoting}
            disabled={!targetClassId || isPromoting}
            className="rounded-xl"
          >
            Confirm Promotion
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
