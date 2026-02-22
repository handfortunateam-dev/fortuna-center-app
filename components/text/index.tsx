import { cn } from "@heroui/theme";
import React from "react";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "muted"
    | "white";
  align?: "left" | "center" | "right" | "justify";
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses = {
  default: "text-gray-900 dark:text-gray-100",
  primary: "text-red-600 dark:text-red-400",
  secondary: "text-gray-600 dark:text-gray-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  muted: "text-gray-500 dark:text-gray-400",
  white: "text-white",
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as: Component = "p",
      size = "base",
      weight = "normal",
      color = "default",
      align = "left",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(
          sizeClasses[size],
          weightClasses[weight],
          colorClasses[color],
          alignClasses[align],
          className,
        )}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Text.displayName = "Text";
