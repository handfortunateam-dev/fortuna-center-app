import React from "react";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";

import { Heading, HeadingProps } from "@/components/heading";

interface CardWrapperProps {
  /**
   * Optional title to display in the card header
   */
  title?: string;

  /**
   * Optional description to display below the title
   */
  description?: React.ReactNode;

  /**
   * The content to render inside the card body
   */
  children: React.ReactNode;

  /**
   * Size of the heading
   * @default '2xl'
   */
  titleSize?: HeadingProps["size"];

  /**
   * Component to use for the heading
   * @default 'h2'
   */
  titleAs?: HeadingProps["as"];

  /**
   * Whether to show a divider after the title
   * @default true (when title is provided)
   */
  showDivider?: boolean;

  /**
   * Custom className for the Card component
   */
  className?: string;

  /**
   * Custom className for the CardBody component
   */
  bodyClassName?: string;

  /**
   * Custom padding for the CardBody
   * @default 'p-6'
   */
  bodyPadding?: string;

  /**
   * Custom gap for the CardBody content
   * @default 'gap-6'
   */
  bodyGap?: string;

  /**
   * Custom padding for the CardHeader
   * @default 'p-6'
   */
  headerPadding?: string;

  /**
   * Custom gap for the CardHeader
   * @default 'gap-3'
   */
  headerGap?: string;
}

export default function CardWrapper({
  title,
  description,
  children,
  titleSize = "2xl",
  titleAs = "h2",
  showDivider = true,
  className = "",
  bodyClassName = "",
  bodyPadding = "p-6",
  bodyGap = "gap-6",
  headerPadding = "p-6",
  headerGap = "gap-3",
}: CardWrapperProps) {
  return (
    <Card className={'rounded-2xl backdrop-blur-xl bg-transparent border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none ' + className}>
      {(title || description) && (
        <CardHeader
          className={`flex flex-col items-start ${headerGap} ${headerPadding}`}
        >
          {title && (
            <Heading as={titleAs} size={titleSize}>
              {title}
            </Heading>
          )}
          {description && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
          {showDivider && <Divider className="w-full mt-2" />}
        </CardHeader>
      )}
      <CardBody className={`${bodyGap} ${bodyPadding} ${bodyClassName}`}>
        {children}
      </CardBody>
    </Card>
  );
}
