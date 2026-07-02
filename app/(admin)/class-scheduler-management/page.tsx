"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Scheduler } from "@/features/scheduler";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Icon } from "@iconify/react";

export default function SchedulerManagementPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Heading weight="extrabold" size="2xl">
          CLASS SCHEDULER
        </Heading>
        <Text weight="medium">
          Manage teacher assignments and student sessions with precision.
        </Text>
      </div>

      {/* Main Scheduler */}
      <Card className="border-none shadow-2xl shadow-primary/5">
        <CardBody className="p-4">
          <Scheduler />
        </CardBody>
      </Card>

      {/* Design Tip */}
      <Card className="border-none bg-primary/5 dark:bg-primary/10 border border-primary/10 shadow-none">
        <CardBody className="p-4 flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Icon icon={"lucide:info"} width={20} height={20} />
          </div>
          <div>
            <Text weight="bold" size="sm">
              Pro Tip: Enhanced Detail View
            </Text>
            <Text size="sm" color="muted">
              Click any class card to view the teaching team and the full list
              of enrolled students in a premium modal.
            </Text>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
