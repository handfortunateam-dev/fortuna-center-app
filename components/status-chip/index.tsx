import { Chip, ChipProps } from "@heroui/react";

export interface StatusOption {
  color: ChipProps["color"];
  label: string;
  variant?: ChipProps["variant"];
}

export interface StatusChipProps extends Omit<ChipProps, "children"> {
  status: string;
  options: Record<string, StatusOption>;
  defaultColor?: ChipProps["color"];
  defaultLabel?: string;
}

export const StatusChip = ({
  status,
  options,
  defaultColor = "default",
  defaultLabel,
  variant = "flat",
  size = "sm",
  ...props
}: StatusChipProps) => {
  const option = options[status] || {
    color: defaultColor,
    label: defaultLabel || status,
  };

  return (
    <Chip
      color={option.color}
      variant={option.variant || variant}
      size={size}
      {...props}
    >
      {option.label}
    </Chip>
  );
};
