"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
// import { Info, Lightbulb, AlertTriangle, XCircle } from "lucide-react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/ui/Text";

type InfoCardType = "tip" | "info" | "warning" | "error";

interface InfoCardProps {
  type?: InfoCardType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  type = "info",
  title,
  children,
  className = "",
}) => {
  const iconMap = {
    tip: <Icon icon="lucide:lightbulb" className="w-5 h-5 text-yellow-500" />,
    info: <Icon icon="lucide:info" className="w-5 h-5 text-blue-600" />,
    warning: <Icon icon="lucide:alert-triangle" className="w-5 h-5 text-amber-600" />,
    error: <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-600" />,
  };

  const colorMap = {
    tip: "border-yellow-200 bg-yellow-50",
    info: "border-blue-200 bg-blue-50",
    warning: "border-amber-200 bg-amber-50",
    error: "border-red-200 bg-red-50",
  };

  return (
    <Card shadow="none" className={`border ${colorMap[type]} ${className}`}>
      <CardBody className="flex items-center gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {title && (
            <div className="flex items-center gap-1">
              {iconMap[type]}
              <Text className="font-semibold capitalize text-sm text-gray-900">
                {title}:
              </Text>
            </div>
          )}
          <Text className="text-sm text-gray-700 inline">{children}</Text>
        </div>
      </CardBody>
    </Card>
  );
};
