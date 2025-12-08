import {
    Button as HeroButton,
    ButtonProps as HeroButtonProps,
  } from "@heroui/react";
  import { ReactNode } from "react";
  
  interface ButtonProps extends Omit<HeroButtonProps, "children"> {
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
    isLoading?: boolean;
    isDisabled?: boolean;
    isIconOnly?: boolean;
    startContent?: ReactNode;
    endContent?: ReactNode;
    fullWidth?: boolean;
    onClick?: () => void;
  }
  
  export const Button = ({
    children,
    variant = "solid",
    color = "primary",
    size = "md",
    isLoading = false,
    isDisabled = false,
    isIconOnly = false,
    startContent,
    endContent,
    fullWidth = false,
    onClick,
    ...props
  }: ButtonProps) => {
    return (
      <HeroButton
        color={color}
        endContent={endContent}
        fullWidth={fullWidth}
        isDisabled={isDisabled}
        isIconOnly={isIconOnly}
        isLoading={isLoading}
        size={size}
        startContent={startContent}
        variant={variant}
        onClick={onClick}
        {...props}
      >
        {children}
      </HeroButton>
    );
  };