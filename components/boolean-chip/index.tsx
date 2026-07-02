import { Chip, ChipProps } from "@heroui/react";
import { ReactNode } from "react";

interface BooleanChipProps extends Omit<ChipProps, "children"> {
  value: boolean;
  trueText?: string;
  falseText?: string;
  trueColor?: ChipProps["color"];
  falseColor?: ChipProps["color"];
  trueIcon?: ReactNode;
  falseIcon?: ReactNode;
}

export const BooleanChip = ({
  value,
  trueText = "Active",
  falseText = "Inactive",
  trueColor = "success",
  falseColor = "danger",
  trueIcon,
  falseIcon,
  ...props
}: BooleanChipProps) => {
  return (
    <Chip
      color={value ? trueColor : falseColor}
      startContent={value ? trueIcon : falseIcon}
      variant="flat"
      size="sm"
      {...props}
    >
      {value ? trueText : falseText}
    </Chip>
  );
};
