import { cn } from "@heroui/theme";
import React from "react";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "base" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
  gradient?: boolean;
  align?: "left" | "center" | "right";
  startContent?: React.ReactNode;
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl sm:text-4xl",
  "4xl": "text-4xl sm:text-5xl",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as: Component = "h2",
      size = "2xl",
      weight = "bold",
      gradient = false,
      align = "left",
      className,
      startContent,
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
          alignClasses[align],
          gradient &&
            "bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 bg-clip-text text-transparent",
          className,
        )}
        {...props}
      >
        {startContent && <span className="mr-2">{startContent}</span>}
        {children}
      </Component>
    );
  },
);

Heading.displayName = "Heading";
