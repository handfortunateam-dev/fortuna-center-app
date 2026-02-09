"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Scheduler } from "@/features/scheduler";

export default function SchedulerManagementPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic">
          CLASS SCHEDULER
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Manage teacher assignments and student sessions with precision.
        </p>
      </div>

      {/* Main Scheduler */}
      <Card className="border-none shadow-2xl shadow-primary/5">
        <CardBody className="p-4">
          <Scheduler />
        </CardBody>
      </Card>

      {/* Design Tip */}
      <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-primary-700 dark:text-primary-300">
            Pro Tip: Enhanced Detail View
          </p>
          <p className="text-xs text-primary-600/70 dark:text-primary-400/70">
            Click any class card to view the teaching team and the full list of
            enrolled students in a premium modal.
          </p>
        </div>
      </div>
    </div>
  );
}
