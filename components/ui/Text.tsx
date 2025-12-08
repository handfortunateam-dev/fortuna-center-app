import { cn } from "@heroui/react";
import { HTMLAttributes } from "react";

// import { cn } from "@/utils/cn";

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "sm" | "md" | "lg";
}

export function Text({ size = "md", className, ...props }: TextProps) {
  return (
    <p
      className={cn(
        "text-default-700",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className
      )}
      {...props}
    />
  );
}