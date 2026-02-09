"use client";

// import type { FieldConfig } from "@/types/form-fields";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

import { TextInput } from "@/components/inputs/TextInput";
import { NumberInput } from "@/components/inputs/NumberInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { RadioInput } from "@/components/inputs/RadioInput";
import { SwitchInput } from "@/components/inputs/SwitchInput";
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { OTPInput } from "@/components/inputs/OTPInput";
import { ReadOnlyInput } from "@/components/inputs/ReadOnlyInput";
import { CurrencyInput } from "@/components/inputs/CurrencyInput";
import { AutocompleteInput, CheckboxInput } from "@/components/inputs";
import { FieldConfig } from "@/interfaces/form-fields";

interface FormFieldRendererProps {
  /**
   * Field configuration
   */
  field: FieldConfig;

  /**
   * Optional className for the field wrapper
   */
  className?: string;
}

/**
 * FormFieldRenderer - Automatically renders the correct input component based on field type
 * This component handles all the logic for rendering different field types
 */
export function FormFieldRenderer({
  field,
  className,
}: FormFieldRendererProps) {
  const { watch } = useFormContext();
  const formValues = watch();

  // Check if field should be shown based on condition
  const shouldShow = useMemo(() => {
    if (!field.condition) return true;

    return field.condition(formValues);
  }, [field.condition, formValues]);

  if (!shouldShow) return null;

  // Common props that all fields share
  const commonProps = {
    name: field.name,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required ?? false,
    disabled: field.disabled ?? false,
  };

  // Render the appropriate component based on field type
  switch (field.type) {
    case "text":
    case "email":
    case "password":
    case "url":
    case "tel":
      return (
        <div className={className}>
          <TextInput
            {...commonProps}
            type={field.type}
            validation={field.validation}
          />
        </div>
      );

    case "number":
      return (
        <div className={className}>
          <NumberInput {...commonProps} />
        </div>
      );

    case "currency":
      return (
        <div className={className}>
          <CurrencyInput {...commonProps} />
        </div>
      );

    case "textarea":
      return (
        <div className={className}>
          <TextareaInput
            {...commonProps}
            maxRows={field.maxRows}
            minRows={field.minRows}
            rows={field.rows}
          />
        </div>
      );

    case "select": {
      const options =
        typeof field.options === "function" ? field.options() : field.options;

      // Don't render if options is a Promise (async)
      if (options instanceof Promise) {
        return null;
      }

      return (
        <div className={className}>
          <SelectInput
            {...commonProps}
            description={field.helperText}
            disallowEmptySelection={field.disallowEmptySelection}
            options={options}
            selectionMode={field.selectionMode}
          />
        </div>
      );
    }

    case "autocomplete": {
      const options =
        typeof field.options === "function" ? field.options() : field.options;

      // Don't render if options is a Promise (async)
      if (options instanceof Promise) {
        return null;
      }

      return (
        <div className={className}>
          <AutocompleteInput {...commonProps} options={options} />
        </div>
      );
    }

    case "radio":
      return (
        <div className={className}>
          <RadioInput {...commonProps} options={field.options} />
        </div>
      );

    case "checkbox":
      return (
        <div className={className}>
          <CheckboxInput
            {...commonProps}
            label={field.checkboxLabel || field.label}
          />
        </div>
      );

    case "switch":
      return (
        <div className={className}>
          <SwitchInput {...commonProps} />
        </div>
      );

    case "date":
    case "datetime":
    case "time":
      return (
        <div className={className}>
          <DatePickerInput {...commonProps} />
        </div>
      );

    case "otp":
      return (
        <div className={className}>
          <OTPInput {...commonProps} length={field.length} />
        </div>
      );

    case "readonly":
      return (
        <div className={className}>
          <ReadOnlyInput {...commonProps} value={field.value} />
        </div>
      );

    case "custom":
      return (
        <div className={className}>{field.render({ name: field.name })}</div>
      );

    default:
      console.warn(`Unknown field type: ${(field as FieldConfig).type}`);

      return null;
  }
}
