"use client";

import { Input } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface CurrencyInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
}

export const CurrencyInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  currency = "IDR",
  locale = "id-ID",
  min,
  max,
}: CurrencyInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numValue)) return "";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const parseCurrency = (value: string): number => {
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
        render={({ field }) => {
          const displayValue = field.value ? formatCurrency(field.value) : "";

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
              onChange={e => {
                const rawValue = parseCurrency(e.target.value);

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
