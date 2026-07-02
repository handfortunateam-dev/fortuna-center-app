"use client";

import { Input } from "@heroui/react";
// import { Search } from "lucide-react";
import { Icon } from "@iconify/react";
import { useState, useCallback, useEffect } from "react";

interface SearchBarProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;

  /**
   * Callback function triggered when search value changes (after debounce)
   */
  onSearch?: (value: string) => void;

  /**
   * Default value for the search input
   */
  defaultValue?: string;

  /**
   * Controlled value for the search input
   */
  value?: string;

  /**
   * Callback for controlled component
   */
  onChange?: (value: string) => void;

  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Size of the search input
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Variant of the input
   * @default "flat"
   */
  variant?: "flat" | "bordered" | "faded" | "underlined";

  /**
   * Radius of the input
   * @default "lg"
   */
  radius?: "none" | "sm" | "md" | "lg" | "full";

  /**
   * Whether to show clear button
   * @default true
   */
  isClearable?: boolean;

  /**
   * Whether the input is disabled
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Full width
   * @default true
   */
  fullWidth?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Custom start icon
   */
  startContent?: React.ReactNode;

  /**
   * Label for the input
   */
  label?: string;

  /**
   * Callback when input is cleared
   */
  onClear?: () => void;
}

/**
 * SearchBar component built with HeroUI
 * Supports both controlled and uncontrolled modes with debouncing
 */
export function SearchBar({
  placeholder = "Cari...",
  onSearch,
  defaultValue = "",
  value: controlledValue,
  onChange,
  debounceMs = 300,
  size = "md",
  variant = "flat",
  radius = "lg",
  isClearable = true,
  isDisabled = false,
  fullWidth = true,
  className,
  startContent,
  label,
  onClear,
}: SearchBarProps) {
  // Determine if component is controlled
  const isControlled = controlledValue !== undefined;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Use controlled value if provided, otherwise use internal state
  const searchValue = isControlled ? controlledValue : internalValue;

  // Debounce timeout ID
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Handle search value change
  const handleValueChange = useCallback(
    (value: string) => {
      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(value);
      }

      // Call onChange if provided (for controlled mode)
      onChange?.(value);

      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set new timeout for debounced search
      const newTimeoutId = setTimeout(() => {
        onSearch?.(value);
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    },
    [isControlled, onChange, onSearch, debounceMs, timeoutId],
  );

  // Handle clear action
  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue("");
    }
    onChange?.("");
    onSearch?.("");
    onClear?.();
  }, [isControlled, onChange, onSearch, onClear]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <Input
      aria-label={label || "Search"}
      className={className}
      classNames={{
        input: "text-sm",
        inputWrapper: [
          "bg-default-100",
          "dark:bg-default-100",
          "backdrop-blur-sm",
          "hover:bg-default-200/70",
          "dark:hover:bg-default-200",
          "group-data-[focused=true]:bg-default-200/70",
          "dark:group-data-[focused=true]:bg-default-200",
          "!cursor-text",
        ],
      }}
      fullWidth={fullWidth}
      isClearable={isClearable}
      isDisabled={isDisabled}
      label={label}
      placeholder={placeholder}
      radius={radius}
      size={size}
      startContent={
        startContent ?? (
          <Icon icon="lucide:search" className="w-4 h-4 text-default-400" />
        )
      }
      type="search"
      value={searchValue}
      variant={variant}
      onClear={handleClear}
      onValueChange={handleValueChange}
    />
  );
}

export default SearchBar;
