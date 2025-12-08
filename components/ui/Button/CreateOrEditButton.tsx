import { Button } from "@heroui/react";
import { PlusIcon, PencilIcon } from "lucide-react";
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
}

export const CreateOrEditButton = ({
  mode,
  onClick,
  label,
  isLoading = false,
  isDisabled = false,
  variant = "solid",
  color = "primary",
  size = "md",
  startContent,
  fullWidth = false,
}: CreateOrEditButtonProps) => {
  const defaultLabel = mode === "create" ? "Buat Baru" : "Edit";
  const Icon = mode === "create" ? PlusIcon : PencilIcon;

  return (
    <Button
      color={color}
      fullWidth={fullWidth}
      isDisabled={isDisabled}
      isLoading={isLoading}
      size={size}
      startContent={startContent || <Icon className="w-4 h-4" />}
      variant={variant}
      onClick={onClick}
    >
      {label || defaultLabel}
    </Button>
  );
};