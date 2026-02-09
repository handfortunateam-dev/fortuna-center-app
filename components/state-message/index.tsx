"use client";

import React from "react";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";

export type StateMessageType =
  | "error"
  | "warning"
  | "info"
  | "success"
  | "empty"
  | "notFound";

interface StateMessageProps {
  type?: StateMessageType;
  title?: string;
  message?: string;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
}

const stateConfig = {
  error: {
    icon: "solar:danger-circle-bold",
    color: "text-danger",
    bgColor: "bg-danger-50 dark:bg-danger-50/10",
    borderColor: "border-danger-200 dark:border-danger-500/30",
    defaultTitle: "Error",
    defaultMessage: "Something went wrong. Please try again.",
  },
  warning: {
    icon: "solar:shield-warning-bold",
    color: "text-warning",
    bgColor: "bg-warning-50 dark:bg-warning-50/10",
    borderColor: "border-warning-200 dark:border-warning-500/30",
    defaultTitle: "Warning",
    defaultMessage: "Please check the information below.",
  },
  info: {
    icon: "solar:info-circle-bold",
    color: "text-primary",
    bgColor: "bg-primary-50 dark:bg-primary-50/10",
    borderColor: "border-primary-200 dark:border-primary-500/30",
    defaultTitle: "Information",
    defaultMessage: "Here's some information you should know.",
  },
  success: {
    icon: "solar:check-circle-bold",
    color: "text-success",
    bgColor: "bg-success-50 dark:bg-success-50/10",
    borderColor: "border-success-200 dark:border-success-500/30",
    defaultTitle: "Success",
    defaultMessage: "Operation completed successfully.",
  },
  empty: {
    icon: "solar:box-minimalistic-bold",
    color: "text-default-400",
    bgColor: "bg-default-50 dark:bg-default-50/10",
    borderColor: "border-default-200 dark:border-default-500/30",
    defaultTitle: "No Data",
    defaultMessage: "No items found.",
  },
  notFound: {
    icon: "solar:question-circle-bold",
    color: "text-default-400",
    bgColor: "bg-default-50 dark:bg-default-50/10",
    borderColor: "border-default-200 dark:border-default-500/30",
    defaultTitle: "Not Found",
    defaultMessage: "The requested item was not found.",
  },
};

export const StateMessage: React.FC<StateMessageProps> = ({
  type = "info",
  title,
  message,
  icon,
  className = "",
  children,
}) => {
  const config = stateConfig[type];

  return (
    <div className={`p-6 ${className}`}>
      <Card
        className={`border-2 ${config.borderColor} ${config.bgColor} shadow-sm`}
      >
        <CardBody className="py-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className={`${config.color}`}>
              <Icon icon={icon || config.icon} className="w-16 h-16" />
            </div>

            {/* Title */}
            {(title || config.defaultTitle) && (
              <h3 className={`text-xl font-semibold ${config.color}`}>
                {title || config.defaultTitle}
              </h3>
            )}

            {/* Message */}
            {(message || config.defaultMessage) && (
              <p className="text-default-600 dark:text-default-400 max-w-md">
                {message || config.defaultMessage}
              </p>
            )}

            {/* Custom Children */}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
