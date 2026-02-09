"use client";

import React from "react";
import { Scheduler } from "@/features/scheduler";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default function SeeSchedulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <Heading as="h1" size="3xl" weight="bold">
          Class Schedules
        </Heading>
        <Text color="muted">
          View all class schedules, times, and locations.
        </Text>
      </div>

      <div className="p-6 rounded-2xl border border-default-200 bg-background shadow-sm">
        <Scheduler readOnly={true} />
      </div>
    </div>
  );
}
