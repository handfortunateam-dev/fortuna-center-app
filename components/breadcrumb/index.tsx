"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
// import { Home, ChevronRight, Folder } from "lucide-react";
import { Icon } from "@iconify/react";
import { ReactNode, Key } from "react";
import { usePathname } from "next/navigation";

export interface BreadcrumbItemType {
  /**
   * Label text for the breadcrumb
   */
  label: string;

  /**
   * Optional href for navigation
   */
  href?: string;

  /**
   * Custom icon for this breadcrumb item
   */
  icon?: ReactNode;

  /**
   * Whether this item is disabled
   */
  isDisabled?: boolean;
}

interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items
   */
  items?: BreadcrumbItemType[];

  /**
   * Whether to auto-generate breadcrumb items from the current URL path
   * If true, `items` prop is ignored
   * @default false
   */
  autoFromPath?: boolean;

  /**
   * Show home icon on first item
   * @default true
   */
  showHomeIcon?: boolean;

  /**
   * Custom separator icon
   */
  separator?: ReactNode;

  /**
   * Default icon for non-first items when no icon is provided
   * @default <Folder />
   */
  defaultItemIcon?: ReactNode;

  /**
   * Size of the breadcrumbs
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Variant style
   * @default "solid"
   */
  variant?: "solid" | "bordered" | "light";

  /**
   * Border radius
   * @default "md"
   */
  radius?: "none" | "sm" | "md" | "lg" | "full";

  /**
   * Color theme
   * @default "default"
   */
  color?:
    | "foreground"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";

  /**
   * Max items to display before collapsing
   */
  maxItems?: number;

  /**
   * Whether breadcrumbs should be underlined
   * @default "none"
   */
  underline?: "none" | "hover" | "always" | "active" | "focus";

  /**
   * Additional class names
   */
  className?: string;

  /**
   * Callback when an item is clicked
   */
  onAction?: (key: Key) => void;
}

/**
 * Breadcrumbs component - Navigation aid showing current page location
 * Built with HeroUI, designed to look like an address bar with icons
 */
export function BreadcrumbsNav({
  items,
  autoFromPath = false,
  showHomeIcon = true,
  separator,
  size = "md",
  variant = "solid",
  radius = "md",
  color = "foreground",
  maxItems,
  underline = "hover",
  className,
  onAction,
  defaultItemIcon,
}: BreadcrumbsProps) {
  // Size mapping for icons
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const iconSize = iconSizes[size];

  const pathname = usePathname();

  const formatSegment = (segment: string) =>
    segment
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const computedItems: BreadcrumbItemType[] = autoFromPath
    ? (() => {
        const segments = (pathname || "/")
          .split("?")[0]
          .split("#")[0]
          .split("/")
          .filter(Boolean);
        const parts: BreadcrumbItemType[] = [];
        // Root
        parts.push({ label: "Home", href: "/dashboard" });
        let current = "";
        for (const seg of segments) {
          current += `/${seg}`;
          parts.push({ label: formatSegment(seg), href: current });
        }
        return parts;
      })()
    : (items ?? []);

  const finalItems = computedItems.map((item, index) => {
    const isFirst = index === 0;
    const icon =
      item.icon ??
      (isFirst && showHomeIcon ? (
        <Icon icon="lucide:home" className={iconSize} />
      ) : (
        (defaultItemIcon ?? <Icon icon="lucide:folder" className={iconSize} />)
      ));
    return {
      ...item,
      icon,
      _key: item.href || item.label,
    } as BreadcrumbItemType & { _key: string };
  });

  return (
    <Breadcrumbs
      className={className}
      classNames={{
        list: "bg-default-100/50 dark:bg-default-50/10 rounded-lg px-3 py-2 backdrop-blur-sm",
        separator: "px-1",
      }}
      color={color}
      itemClasses={{
        item: [
          "transition-colors",
          "data-[current=true]:font-semibold",
          "data-[current=true]:text-foreground",
        ],
        separator: "text-default-400",
      }}
      maxItems={maxItems}
      radius={radius}
      separator={
        separator ?? (
          <Icon
            icon="lucide:chevron-right"
            className={`${iconSize} text-default-400`}
          />
        )
      }
      size={size}
      underline={underline}
      variant={variant}
      onAction={onAction}
    >
      {finalItems.map((item) => (
        <BreadcrumbItem
          key={item._key}
          classNames={{
            item: [
              "flex items-center gap-1.5",
              "data-[current=false]:text-default-500",
              "data-[current=false]:hover:text-foreground",
              "transition-colors duration-200",
            ],
          }}
          href={item.href}
          isDisabled={item.isDisabled}
          startContent={item.icon}
          className="dark:text-gray-200"
        >
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}

export default BreadcrumbsNav;
