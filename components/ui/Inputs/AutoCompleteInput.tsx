"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@heroui/react";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

// import { FormFieldWrapper } from "./FormFieldWrapper";

interface Option {
  label: string;
  value: string | number | boolean;
}

interface AutocompleteInputProps {
  name: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  // loading?: boolean;
  onChange?: (value: string | number | boolean) => void;
  isLoading?: boolean;
  isClearable?: boolean;
}

export const AutocompleteInput = ({
  name,
  label,
  options,
  placeholder = "Ketik atau pilih...",
  disabled = false,
  required = true,
  // loading = false,
  onChange,
  isLoading = false,
  isClearable = false,
}: AutocompleteInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

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
          <Autocomplete
            aria-label={label ?? name}
            isClearable={isClearable}
            isDisabled={disabled}
            isInvalid={!!error}
            isLoading={isLoading}
            placeholder={placeholder}
            selectedKey={String(field.value)}
            onSelectionChange={(key: string | number | null) => {
              const selected = key as string;
              let newValue: Option["value"] = selected;

              if (selected === "true") newValue = true;
              else if (selected === "false") newValue = false;

              field.onChange(newValue);
              onChange?.(newValue);
            }}
          >
            {options.map(opt => (
              <AutocompleteItem key={String(opt.value)}>
                {opt.label}
              </AutocompleteItem>
            ))}
          </Autocomplete>
        )}
      />
    </FormFieldWrapper>
  );
};
