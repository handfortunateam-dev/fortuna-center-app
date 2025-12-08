"use client";

import { Card, CardBody } from "@heroui/react";
// import { FileQuestion } from "lucide-react";
import type React from "react";
import { Icon } from "@iconify/react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon = <Icon icon="heroicons:file-question" className="w-12 h-12 text-gray-300 dark:text-gray-600" />,
}: EmptyStateProps) {
  return (
    <Card
      shadow="none"
      className="flex flex-col items-center justify-center text-center p-10 bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl"
    >
      <CardBody className="flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">{icon}</div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">{description}</p>
      </CardBody>
    </Card>
  );
}
