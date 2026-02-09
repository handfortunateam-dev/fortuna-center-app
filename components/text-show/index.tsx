import React from "react";
import { cn } from "@heroui/theme";

type ValueType = string | number | boolean | null | undefined;

interface TextShowProps {
  label: string;
  value?: ValueType;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  orientation?: "horizontal" | "vertical";
  renderValue?: (value: ValueType) => React.ReactNode;
}

export default function TextShow({
  label,
  value,
  className,
  labelClassName,
  valueClassName,
  orientation = "vertical",
  renderValue,
}: TextShowProps) {
  const displayValue = renderValue
    ? renderValue(value)
    : value === null || value === undefined
      ? "-"
      : String(value);

  return (
    <div
      className={cn(
        "flex gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
        className,
      )}
    >
      <dt
        className={cn(
          "text-sm font-medium text-gray-600 dark:text-gray-400",
          labelClassName,
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-base text-gray-900 dark:text-gray-100",
          orientation === "horizontal" && "ml-auto",
          valueClassName,
        )}
      >
        {displayValue}
      </dd>
    </div>
  );
}
