import { Chip, ChipProps } from "@heroui/react";

export type StudentStatus = "active" | "inactive" | "on_leave";

interface StudentStatusChipProps extends Omit<ChipProps, "children"> {
  status?: StudentStatus | string;
}

export const StudentStatusChip = ({
  status = "active",
  ...props
}: StudentStatusChipProps) => {
  let color: ChipProps["color"] = "default";
  let text = status;

  switch (status) {
    case "active":
      color = "success";
      text = "Active";
      break;
    case "inactive":
      color = "danger";
      text = "Inactive";
      break;
    case "on_leave":
      color = "warning";
      text = "On Leave";
      break;
    default:
      color = "default";
      break;
  }

  return (
    <Chip color={color} variant="flat" size="sm" {...props}>
      {text}
    </Chip>
  );
};
