import { Button as HeroButton, Link } from "@heroui/react";
import { ReactNode } from "react";

interface LinkButtonProps {
  href: string;
  children: ReactNode;
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
  isDisabled?: boolean;
  isExternal?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  fullWidth?: boolean;
  showAnchorIcon?: boolean;
}

export const LinkButton = ({
  href,
  children,
  variant = "solid",
  color = "primary",
  size = "md",
  isDisabled = false,
  isExternal = false,
  startContent,
  endContent,
  fullWidth = false,
  showAnchorIcon = false,
}: LinkButtonProps) => {
  return (
    <HeroButton
      as={Link}
      color={color}
      endContent={endContent}
      fullWidth={fullWidth}
      href={href}
      isDisabled={isDisabled}
      isExternal={isExternal}
      showAnchorIcon={showAnchorIcon}
      size={size}
      startContent={startContent}
      variant={variant}
    >
      {children}
    </HeroButton>
  );
};