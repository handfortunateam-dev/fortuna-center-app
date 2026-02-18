import { Button } from "@heroui/react";
import { Icon } from "@iconify/react"; // Changed import
import { ReactNode } from "react";

interface CreateOrEditButtonProps {
  mode: "create" | "edit";
  onClick?: () => void;
  label?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  startContent?: ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

export const CreateOrEditButton = ({
  mode,
  onClick,
  label,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  color = "primary",
  size = "lg",
  startContent,
  fullWidth = false,
  type = "button",
}: CreateOrEditButtonProps) => {
  const defaultLabel = mode === "create" ? "Buat Baru" : "Edit";
  const iconName = mode === "create" ? "lucide:plus" : "lucide:pencil";

  return (
    <Button
      color={color}
      fullWidth={fullWidth}
      isDisabled={isDisabled}
      isLoading={isLoading}
      size={size} // Default prop value updated or passed as lg
      startContent={
        startContent || <Icon icon={iconName} className="w-6 h-6" />
      }
      type={type}
      variant={variant}
      onClick={onClick}
    >
      {label || defaultLabel}
    </Button>
  );
};
