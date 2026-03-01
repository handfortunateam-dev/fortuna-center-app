import { Chip } from "@heroui/react";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

interface TicketStatusChipProps {
  status: TicketStatus;
}

const statusConfig: Record<TicketStatus, { color: "warning" | "primary" | "success" | "default"; label: string }> = {
  open: { color: "warning", label: "Open" },
  in_progress: { color: "primary", label: "In Progress" },
  resolved: { color: "success", label: "Resolved" },
  closed: { color: "default", label: "Closed" },
};

export const TicketStatusChip = ({ status }: TicketStatusChipProps) => {
  const config = statusConfig[status] || statusConfig.closed;
  
  return (
    <Chip
      color={config.color}
      variant="flat"
      size="sm"
    >
      {config.label}
    </Chip>
  );
};
