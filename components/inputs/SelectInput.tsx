"use client";

import { Select, SelectItem } from "@heroui/react";
import { Controller, useFormContext, RegisterOptions } from "react-hook-form";

import { FormFieldWrapper } from "../form/FormFieldWrapper";

interface SelectOption {
  label: string;
  value: string;
  errorMessage?: string;
  description?: string;
}

interface SelectInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  options: SelectOption[];
  errorMessage?: string;
  description?: string;
  isInvalid?: boolean;
  selectionMode?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  validation?: RegisterOptions;
}

export const SelectInput = ({
  name,
  label,
  placeholder = "Pilih opsi...",
  disabled = false,
  required = true,
  options,
  isInvalid = false,
  description,
  selectionMode = "single",
  errorMessage,
  disallowEmptySelection = false,
  validation,
}: SelectInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <FormFieldWrapper
      key={name}
      helperText={description}
      label={label}
      name={name}
      required={required}
    >
      <Controller
        control={control}
        name={name}
        rules={validation}
        render={({ field }) => {
          // Convert field value to selection keys
          // Always provide a Set to avoid uncontrolled-to-controlled warning
          let selectedKeys: Set<string>;

          if (selectionMode === "multiple") {
            selectedKeys = new Set(field.value ?? []);
          } else {
            selectedKeys = new Set(field.value ? [String(field.value)] : []);
          }

          return (
            <Select
              aria-label={label}
              classNames={{
                value: "dark:text-white",
                trigger: "dark:bg-gray-800 dark:border-gray-700",
                label: "dark:text-gray-300",
                listbox: "dark:bg-gray-800",
                popoverContent: "dark:bg-gray-800",
              }}
              disallowEmptySelection={disallowEmptySelection}
              // errorMessage={}

              errorMessage={errorMessage || error}
              isDisabled={disabled}
              isRequired={required}
              isInvalid={!!error || isInvalid}
              labelPlacement="outside"
              placeholder={placeholder}
              selectedKeys={selectedKeys}
              selectionMode={selectionMode}
              onSelectionChange={(keys: "all" | Set<React.Key>) => {
                const keyArray: string[] = Array.from(keys as Set<string>);

                if (selectionMode === "multiple") {
                  field.onChange(keyArray);
                } else {
                  field.onChange(keyArray[0] || null);
                }
              }}
            >
              {options.map((option: SelectOption) => (
                <SelectItem key={option.value}>{option.label}</SelectItem>
              ))}
            </Select>
          );
        }}
      />
    </FormFieldWrapper>
  );
};
