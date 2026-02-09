import { Chip } from "@heroui/react";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "dot";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  startContent?: ReactNode;
  endContent?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Badge = ({
  children,
  variant = "flat",
  color = "default",
  size = "md",
  radius = "full",
  startContent,
  endContent,
  onClose,
  className,
}: BadgeProps) => {
  return (
    <Chip
      className={className}
      color={color}
      endContent={endContent}
      radius={radius}
      size={size}
      startContent={startContent}
      variant={variant}
      onClose={onClose}
    >
      {children}
    </Chip>
  );
};