"use client";

import { Textarea } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface TextareaInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  minRows?: number;
  maxRows?: number;
  errorMessage?: string;
  maxLength?: number;
  description?: string;
}

export const TextareaInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  rows,
  minRows,
  maxRows,
  maxLength,
  errorMessage,
  description,
}: TextareaInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <FormFieldWrapper
      helperText={description}
      label={label}
      name={name}
      required={required}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Textarea
            {...field}
            classNames={{
              input: "dark:text-white",
              inputWrapper: "dark:bg-gray-800 dark:border-gray-700",
              label: "dark:text-gray-300",
              description: "dark:text-gray-400",
            }}
            errorMessage={error || errorMessage}
            id={name}
            isDisabled={disabled}
            isInvalid={!!error}
            isRequired={required}
            labelPlacement="outside"
            maxLength={maxLength}
            maxRows={maxRows}
            minRows={minRows || rows}
            placeholder={placeholder}
            value={field.value || ""}
          />
        )}
      />
    </FormFieldWrapper>
  );
};
