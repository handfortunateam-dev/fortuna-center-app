import { Divider } from "@heroui/react";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export const Separator = ({
  orientation = "horizontal",
  className,
}: SeparatorProps) => {
  return <Divider className={className} orientation={orientation} />;
};