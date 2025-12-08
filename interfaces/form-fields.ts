import { ReactNode } from "react";

/**
 * Base field configuration
 */
export interface BaseFieldConfig {
  /**
   * Field name (used for react-hook-form)
   */
  name: string;

  /**
   * Field label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Helper text shown below the field
   */
  helperText?: string;

  /**
   * Custom validation rules (Zod schema is preferred, but this can be used for react-hook-form validation)
   */
  validation?: Record<string, unknown>;

  /**
   * Condition to show/hide field based on form values
   */
  condition?: (formValues: Record<string, unknown>) => boolean;

  /**
   * Grid column span (for responsive layouts)
   * @default 1
   */
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;

  /**
   * Custom className
   */
  className?: string;
}

/**
 * Text input field
 */
export interface TextFieldConfig extends BaseFieldConfig {
  type: "text" | "email" | "password" | "url" | "tel";
  /**
   * Input size
   */
  size?: "sm" | "md" | "lg";
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Prefix icon or text
   */
  startContent?: ReactNode;
  /**
   * Suffix icon or text
   */
  endContent?: ReactNode;
}

/**
 * Number input field
 */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: "number" | "currency";
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step value
   */
  step?: number;
  /**
   * Currency symbol (for currency type)
   */
  currencySymbol?: string;
}

/**
 * Textarea field
 */
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: "textarea";
  /**
   * Number of rows
   */
  rows?: number;
  /**
   * Minimum rows
   */
  minRows?: number;
  /**
   * Maximum rows
   */
  maxRows?: number;
  /**
   * Maximum length
   */
  maxLength?: number;
}

/**
 * Select option
 */
export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Select field
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: "select";
  /**
   * Options for the select
   */
  options:
    | SelectOption[]
    | (() => SelectOption[])
    | (() => Promise<SelectOption[]>);
  /**
   * Selection mode
   */
  selectionMode?: "single" | "multiple";
  /**
   * Whether to allow empty selection
   */
  disallowEmptySelection?: boolean;
}

/**
 * Autocomplete field
 */
export interface AutocompleteFieldConfig extends BaseFieldConfig {
  type: "autocomplete";
  /**
   * Options for autocomplete
   */
  options:
    | SelectOption[]
    | (() => SelectOption[])
    | (() => Promise<SelectOption[]>);
  /**
   * Allow custom values
   */
  allowCustomValue?: boolean;
}

/**
 * Radio field
 */
export interface RadioFieldConfig extends BaseFieldConfig {
  type: "radio";
  /**
   * Radio options
   */
  options: SelectOption[];
  /**
   * Orientation
   */
  orientation?: "horizontal" | "vertical";
}

/**
 * Checkbox field
 */
export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: "checkbox";
  /**
   * Checkbox label (if different from field label)
   */
  checkboxLabel?: string;
}

/**
 * Switch field
 */
export interface SwitchFieldConfig extends BaseFieldConfig {
  type: "switch";
  /**
   * Switch label (if different from field label)
   */
  switchLabel?: string;
  /**
   * Default checked value
   */
  defaultChecked?: boolean;
}

/**
 * Date picker field
 */
export interface DateFieldConfig extends BaseFieldConfig {
  type: "date" | "datetime" | "time";
  /**
   * Minimum date
   */
  minDate?: Date | string;
  /**
   * Maximum date
   */
  maxDate?: Date | string;
  /**
   * Date format
   */
  dateFormat?: string;
}

/**
 * OTP field
 */
export interface OTPFieldConfig extends BaseFieldConfig {
  type: "otp";
  /**
   * Number of OTP digits
   */
  length?: number;
}

/**
 * Read-only field
 */
export interface ReadOnlyFieldConfig extends BaseFieldConfig {
  type: "readonly";
  /**
   * Value to display
   */
  value?: string | number;
}

/**
 * Custom field (render your own component)
 */
export interface CustomFieldConfig extends BaseFieldConfig {
  type: "custom";
  /**
   * Custom render function
   */
  render: (props: { name: string; error?: string }) => ReactNode;
}

/**
 * Union type of all field configurations
 */
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | AutocompleteFieldConfig
  | RadioFieldConfig
  | CheckboxFieldConfig
  | SwitchFieldConfig
  | DateFieldConfig
  | OTPFieldConfig
  | ReadOnlyFieldConfig
  | CustomFieldConfig;

/**
 * Form section - group related fields
 */
export interface FormSection {
  /**
   * Section title
   */
  title?: string;
  /**
   * Section description
   */
  description?: string;
  /**
   * Fields in this section
   */
  fields: FieldConfig[];
  /**
   * Number of columns in grid layout
   * @default 1
   */
  columns?: 1 | 2 | 3 | 4;
  /**
   * Condition to show/hide entire section
   */
  condition?: (formValues: Record<string, unknown>) => boolean;
}

/**
 * Complete form schema
 */
export interface FormSchema {
  /**
   * Form sections
   */
  sections: FormSection[];
}
