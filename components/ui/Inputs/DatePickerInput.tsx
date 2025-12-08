"use client";

import { DatePicker, DateRangePicker } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";
import { parseDate, CalendarDate } from "@internationalized/date";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface DatePickerInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  granularity?: "day" | "hour" | "minute" | "second";
  // Range mode
  rangeMode?: boolean;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
}

export const DatePickerInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  granularity = "day",
  rangeMode = false,
  minValue,
  maxValue,
}: DatePickerInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  // Single date picker
  if (!rangeMode) {
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
            let dateValue: CalendarDate | undefined;

            if (field.value) {
              try {
                if (typeof field.value === "string") {
                  // Parse ISO date string (YYYY-MM-DD)
                  dateValue = parseDate(field.value);
                } else if (field.value instanceof Date) {
                  // Convert Date object to CalendarDate
                  const isoString = field.value.toISOString().split("T")[0];

                  dateValue = parseDate(isoString as string);
                }
              } catch (e) {
                console.error("Error parsing date:", e);
              }
            }

            return (
              <DatePicker
                errorMessage={error}
                granularity={granularity}
                isDisabled={disabled}
                isInvalid={!!error}
                isRequired={required}
                minValue={minValue}
                value={dateValue}
                onChange={date => {
                  if (date) {
                    // Convert CalendarDate to ISO string
                    const isoString = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;

                    field.onChange(isoString);
                  } else {
                    field.onChange(null);
                  }
                }}
                aria-label={label}
                // label={placeholder}
                maxValue={maxValue}
              />
            );
          }}
        />
      </FormFieldWrapper>
    );
  }

  // Date range picker
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
        render={({ field }) => (
          <DateRangePicker
            errorMessage={error}
            granularity={granularity}
            isDisabled={disabled}
            isInvalid={!!error}
            isRequired={required}
            label={placeholder}
            maxValue={maxValue}
            minValue={minValue}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </FormFieldWrapper>
  );
};
