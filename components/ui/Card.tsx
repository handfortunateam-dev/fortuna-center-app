import {
  Card as HeroCard,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/react";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  isHoverable?: boolean;
  isPressable?: boolean;
  isBlurred?: boolean;
  isFooterBlurred?: boolean;
  onPress?: () => void;
}

export const Card = ({
  children,
  header,
  footer,
  className,
  shadow = "md",
  radius = "lg",
  fullWidth = false,
  isHoverable = false,
  isPressable = false,
  isBlurred = false,
  isFooterBlurred = false,
  onPress,
}: CardProps) => {
  return (
    <HeroCard
      className={className}
      fullWidth={fullWidth}
      isBlurred={isBlurred}
      isFooterBlurred={isFooterBlurred}
      isHoverable={isHoverable}
      isPressable={isPressable}
      radius={radius}
      shadow={shadow}
      onPress={onPress}
    >
      {header && <CardHeader>{header}</CardHeader>}
      <CardBody>{children}</CardBody>
      {footer && <CardFooter>{footer}</CardFooter>}
    </HeroCard>
  );
};
