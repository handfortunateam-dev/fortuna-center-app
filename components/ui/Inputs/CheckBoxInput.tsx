"use client";

import { Checkbox, CheckboxGroup } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
}

interface CheckboxInputProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  // Single checkbox mode
  singleMode?: boolean;
  // Multiple checkbox mode
  options?: CheckboxOption[];
  orientation?: "horizontal" | "vertical";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
}

export const CheckboxInput = ({
  name,
  label,
  description,
  disabled = false,
  required = false,
  singleMode = true,
  options = [],
  orientation = "vertical",
  color = "primary",
}: CheckboxInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  // Single checkbox mode
  if (singleMode) {
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
            <Checkbox
              classNames={{
                label: "dark:text-gray-300",
                wrapper: "dark:border-gray-600",
              }}
              color={color}
              isDisabled={disabled}
              isInvalid={!!error}
              isSelected={field.value}
              onValueChange={field.onChange}
            >
              {description}
            </Checkbox>
          )}
        />
      </FormFieldWrapper>
    );
  }

  // Multiple checkbox mode (CheckboxGroup)
  return (
    <FormFieldWrapper
      error={error}
      helperText={description}
      label={label}
      name={name}
      required={required}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <CheckboxGroup
            classNames={{
              label: "dark:text-gray-300",
              description: "dark:text-gray-400",
            }}
            color={color}
            isDisabled={disabled}
            isInvalid={!!error}
            orientation={orientation}
            value={field.value || []}
            onValueChange={field.onChange}
          >
            {options.map(option => (
              <Checkbox
                key={option.value}
                classNames={{
                  label: "dark:text-gray-300",
                  wrapper: "dark:border-gray-600",
                }}
                value={option.value}
              >
                {option.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
        )}
      />
    </FormFieldWrapper>
  );
};
