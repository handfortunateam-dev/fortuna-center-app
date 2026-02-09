"use client";

import { Input, type InputProps } from "@heroui/react";
import {
  useFormContext,
  type RegisterOptions,
  Controller,
} from "react-hook-form";
import { FormFieldWrapper } from "../form/FormFieldWrapper";

interface TimeInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  validation?: RegisterOptions;
  description?: string;
  labelPlacement?: InputProps["labelPlacement"];
  defaultValue?: string;
}

export const TimeInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  isInvalid = false,
  errorMessage,
  validation,
  description,
  labelPlacement = "outside",
  defaultValue,
}: TimeInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      required={required}
      helperText={description}
    >
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue ?? ""}
        render={({ field }) => (
          <Input
            type="time"
            id={name}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            isDisabled={disabled}
            isInvalid={!!error || isInvalid}
            errorMessage={error || errorMessage}
            labelPlacement={labelPlacement}
            isRequired={required}
            classNames={{
              input: "dark:text-white",
              inputWrapper: "dark:bg-gray-800 dark:border-gray-700",
              label: "dark:text-gray-300",
            }}
          />
        )}
        rules={validation}
      />
    </FormFieldWrapper>
  );
};
