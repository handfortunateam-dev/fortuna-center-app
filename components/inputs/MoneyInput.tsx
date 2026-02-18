"use client";

import { Input } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

import { FormFieldWrapper } from "../form/FormFieldWrapper";

interface MoneyInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  rules?: any;
}

export const MoneyInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  currency = "IDR",
  locale = "id-ID",
  min,
  max,
  rules,
}: MoneyInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  const formatCurrency = (value: number | string): string => {
    // If value is empty or null/undefined
    if (value === "" || value === null || value === undefined) return "";

    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    // Format using Intl but strip the currency symbol for cleaner input if desired,
    // or keep full format. The user requested 'MoneyInput' to handle money.
    // Let's format as number for display without symbol inside the input value itself
    // because we show the symbol in startContent.
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const parseCurrency = (value: string): number => {
    // Remove non-digit characters
    const cleaned = value.replace(/[^\d]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  return (
    <FormFieldWrapper
      error={error}
      label={label}
      name={name}
      required={required}
    >
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => {
          // Format value for display
          const displayValue =
            field.value !== undefined && field.value !== null
              ? formatCurrency(field.value)
              : "";

          return (
            <Input
              errorMessage={error}
              id={name}
              isDisabled={disabled}
              isInvalid={!!error}
              isRequired={required}
              placeholder={placeholder}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">
                    {currency}
                  </span>
                </div>
              }
              type="text"
              value={displayValue}
              onValueChange={(val) => {
                // Parse the display value back to number
                const rawValue = parseCurrency(val);

                if (min !== undefined && rawValue < min) return;
                if (max !== undefined && rawValue > max) return;
                field.onChange(rawValue);
              }}
            />
          );
        }}
      />
    </FormFieldWrapper>
  );
};
