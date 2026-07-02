"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  Divider,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useStudentDetail } from "@/services/studentsService";
import { useClasses } from "@/services/classesService";
import { ClassItem } from "@/features/lms/classes/interfaces";
import { CLASS_LEVELS } from "@/features/lms/classes/constants";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@/components/alert-dialog";

export default function StudentPromotionPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const queryClient = useQueryClient();

  const [targetClassId, setTargetClassId] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // Fetch student details
  const { data: studentResponse, isLoading: isLoadingStudent } = useStudentDetail(studentId);
  const student = studentResponse?.data;

  // Fetch available classes
  const { data: classesResponse, isLoading: isLoadingClasses } = useClasses({ isActive: true });
  const rawClasses = classesResponse?.data || [];

  // Sort classes by academic level
  const classes = [...rawClasses].sort((a, b) => {
    const levelA = a.level || "";
    const levelB = b.level || "";
    const indexA = (CLASS_LEVELS as unknown as string[]).indexOf(levelA);
    const indexB = (CLASS_LEVELS as unknown as string[]).indexOf(levelB);
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    return orderA - orderB;
  });

  const handlePromote = async () => {
    if (!student || !targetClassId) return;

    setIsPromoting(true);
    try {
      const response = await apiClient.post(`/students/${studentId}/promote`, {
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
          queryKey: ["students", "detail", studentId],
        });

        router.push("/students");
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

  if (isLoadingStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon icon="line-md:loading-twotone-loop" className="text-4xl text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-4 text-center">
        <p className="text-default-500">Student not found.</p>
        <Button className="mt-4" onPress={() => router.push("/students")}>
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Breadcrumbs>
        <BreadcrumbItem href="/students">Students</BreadcrumbItem>
        <BreadcrumbItem>{student.firstName} {student.lastName}</BreadcrumbItem>
        <BreadcrumbItem>Promote</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promote Student</h1>
        <Button variant="light" onPress={() => router.push("/students")} startContent={<Icon icon="lucide:arrow-left" />}>
          Back
        </Button>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-default-50/50 backdrop-blur-sm">
        <CardHeader className="p-6 pb-0 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:user-bold" className="text-3xl text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {[student.firstName, student.middleName, student.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </h2>
              <p className="text-default-500 font-medium">ID: {student.studentId}</p>
            </div>
          </div>
          
          {student.currentLevel && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Icon icon="solar:square-academic-cap-bold" />
              Current Level: {student.currentLevel}
            </div>
          )}
        </CardHeader>
        
        <CardBody className="p-6 space-y-8">
          <Divider className="opacity-50" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Icon icon="solar:round-transfer-vertical-bold" className="text-2xl" />
              <h3>Select Target Class</h3>
            </div>
            
            <div className="max-w-md">
              <Select
                label="New Class"
                placeholder="Choose the class for promotion"
                selectedKeys={targetClassId ? [targetClassId] : []}
                onSelectionChange={(keys) => {
                  const selectedId = Array.from(keys)[0] as string;
                  
                  if (student.enrolledClass?.id === selectedId) {
                    setAlertConfig({
                      isOpen: true,
                      title: "Invalid Promotion",
                      message: "The student is already enrolled in this class. Please select a different class for promotion.",
                    });
                    // Don't set the target class ID if it's the same
                    return;
                  }
                  
                  setTargetClassId(selectedId);
                }}
                isLoading={isLoadingClasses}
                variant="bordered"
                classNames={{
                  trigger: "rounded-xl border-default-200 hover:border-primary transition-colors h-14",
                  label: "text-default-600 font-medium",
                }}
                items={classes}
              >
                {(cls: ClassItem) => (
                  <SelectItem
                    key={cls.id}
                    textValue={`${cls.name} (${cls.level || "No Level"})`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{cls.name}</span>
                      <span className="text-xs text-default-400">
                        Level: {cls.level || "Unspecified"}
                      </span>
                    </div>
                  </SelectItem>
                )}
              </Select>
              
              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                <Icon icon="solar:info-circle-bold" className="text-xl text-primary mt-0.5" />
                <p className="text-xs text-default-600 leading-relaxed italic">
                  Note: Promoting will mark the current active enrollment as
                  completed and create a new enrollment in the selected class.
                  Attendance history and grades will remain saved in the system.
                </p>
              </div>
            </div>
          </div>
          
          <Divider className="opacity-50" />
          
          <div className="flex items-center gap-3 pt-2">
            <Button
              color="primary"
              size="lg"
              onPress={handlePromote}
              isLoading={isPromoting}
              disabled={!targetClassId || isPromoting}
              className="rounded-xl px-12 font-bold shadow-lg shadow-primary/20"
            >
              Confirm Promotion
            </Button>
            <Button
              variant="flat"
              size="lg"
              onPress={() => router.push("/students")}
              disabled={isPromoting}
              className="rounded-xl px-8 font-medium"
            >
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type="warning"
      />
    </div>
  );
}
