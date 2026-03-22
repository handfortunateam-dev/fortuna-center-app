"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useClasses } from "@/services/classesService";
import { ClassItem } from "@/features/lms/classes/interfaces";
import { CLASS_LEVELS } from "@/features/lms/classes/constants";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";

export default function BulkPromotionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [sourceClassId, setSourceClassId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // Fetch available classes
  const { data: classesResponse, isLoading: isLoadingClasses } = useClasses({ isActive: true });
  const rawClasses = classesResponse?.data || [];

  // Sort classes by academic level
  const classes = [...rawClasses].sort((a, b) => {
    const levelA = a.level || "";
    const levelB = b.level || "";
    
    // Use the index in CLASS_LEVELS for ordering
    const indexA = (CLASS_LEVELS as unknown as string[]).indexOf(levelA);
    const indexB = (CLASS_LEVELS as unknown as string[]).indexOf(levelB);
    
    // If not found in CLASS_LEVELS, put it at the end
    const orderA = indexA === -1 ? 999 : indexA;
    const orderB = indexB === -1 ? 999 : indexB;
    
    return orderA - orderB;
  });

  const handleBulkPromote = async () => {
    if (!sourceClassId || !targetClassId) return;

    if (sourceClassId === targetClassId) {
      Toast({
        title: "Invalid Selection",
        description: "Source and target classes cannot be the same.",
        color: "warning",
      });
      return;
    }

    setIsPromoting(true);
    try {
      const response = await apiClient.post("/students/bulk-promote", {
        sourceClassId,
        targetClassId,
      });

      if (response.data.success) {
        Toast({
          title: "Bulk Promotion Success",
          description: response.data.message || `Students have been promoted successfully.`,
          color: "success",
        });

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["/students"] });
        queryClient.invalidateQueries({ queryKey: ["/classes"] });

        router.push("/students");
      } else {
        throw new Error(response.data.message || "Failed to process bulk promotion");
      }
    } catch (error) {
      console.error("Bulk promotion error:", error);
      Toast({
        title: "Promotion Failed",
        description: error instanceof Error ? error.message : "An error occurred during bulk promotion",
        color: "danger",
      });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Breadcrumbs>
        <BreadcrumbItem href="/students">Students</BreadcrumbItem>
        <BreadcrumbItem>Bulk Promote</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bulk Student Promotion</h1>
        <Button 
          variant="light" 
          onPress={() => router.push("/students")} 
          startContent={<Icon icon="lucide:arrow-left" />}
        >
          Back
        </Button>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-default-50/50 backdrop-blur-sm">
        <CardHeader className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:users-group-rounded-bold" className="text-2xl text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Quick Transition</h2>
              <p className="text-default-500 text-sm">Move all active students from one class to another at once.</p>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Source Class */}
            <Select
              label="Source Class (Kelas Asal)"
              placeholder="Select students' current class"
              selectedKeys={sourceClassId ? [sourceClassId] : []}
              onSelectionChange={(keys) =>
                setSourceClassId(Array.from(keys)[0] as string)
              }
              isLoading={isLoadingClasses}
              variant="bordered"
              classNames={{
                trigger: "rounded-xl border-default-200 h-16",
              }}
              items={classes}
            >
              {(cls: ClassItem) => (
                <SelectItem
                  key={cls.id}
                  textValue={cls.name}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{cls.name}</span>
                    <span className="text-xs text-default-400">Level: {cls.level || "Unspecified"}</span>
                  </div>
                </SelectItem>
              )}
            </Select>

            <div className="flex justify-center md:pt-4">
              <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
                <Icon icon="solar:arrow-right-bold" className="text-xl text-default-400 rotate-90 md:rotate-0" />
              </div>
            </div>

            {/* Target Class */}
            <Select
              label="Target Class (Kelas Tujuan)"
              placeholder="Select destination class"
              selectedKeys={targetClassId ? [targetClassId] : []}
              onSelectionChange={(keys) =>
                setTargetClassId(Array.from(keys)[0] as string)
              }
              isLoading={isLoadingClasses}
              variant="bordered"
              classNames={{
                trigger: "rounded-xl border-default-200 h-16",
              }}
              items={classes}
            >
              {(cls: ClassItem) => (
                <SelectItem
                  key={cls.id}
                  textValue={cls.name}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{cls.name}</span>
                    <span className="text-xs text-default-400">Level: {cls.level || "Unspecified"}</span>
                  </div>
                </SelectItem>
              )}
            </Select>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
            <Icon icon="solar:info-circle-bold" className="text-xl text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-primary">Bulk Operation Info</p>
              <p className="text-xs text-default-600 leading-relaxed italic">
                Operasi ini akan memindahkan SEMUA murid dengan status aktif dari **Kelas Asal** ke **Kelas Tujuan**.
                Status pendaftaran lama akan ditandai sebagai **&quot;Completed&quot;** dan pendaftaran baru akan dibuat.
                Profil level setiap murid juga akan diperbarui.
              </p>
            </div>
          </div>

          <Divider className="opacity-50" />
          
          <div className="flex items-center gap-3 pt-2">
            <Button
              color="primary"
              size="lg"
              onPress={handleBulkPromote}
              isLoading={isPromoting}
              disabled={!sourceClassId || !targetClassId || isPromoting}
              className="rounded-xl px-12 font-bold shadow-lg shadow-primary/20"
              startContent={<Icon icon="solar:rocket-bold" className="text-xl" />}
            >
              Start Bulk Promotion
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
    </div>
  );
}
