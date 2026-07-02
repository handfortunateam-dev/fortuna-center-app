"use client";

import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="max-w-md w-full">
        <CardBody className="flex flex-col items-center text-center p-8 gap-6">
          <div className="w-20 h-20 bg-warning-50 text-warning-500 rounded-full flex items-center justify-center animate-pulse">
            <Icon icon="solar:shield-warning-bold" className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Under Maintenance</h1>
            <p className="text-default-500">
              We are currently performing scheduled maintenance. Please check
              back later.
            </p>
          </div>

          <div className="bg-default-100 px-4 py-2 rounded-lg text-xs text-default-400 font-mono">
            System Upgrade inside Fortuna Center
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
