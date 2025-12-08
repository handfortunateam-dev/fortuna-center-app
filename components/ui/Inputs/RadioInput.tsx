import { RadioGroup, Radio } from "@heroui/react";
import { useFormContext, Controller } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";
// import { FormFieldWrapper } from "./FormFieldWrapper";

interface Option {
  label: string;
  value: string | number | boolean;
  description?: string;
}

interface RadioInputProps {
  name: string;
  label?: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  defaultValue?: string | number | boolean;
}

export const RadioInput = ({
  name,
  label,
  options,
  required = true,
  disabled = false,
  color = "default",
  defaultValue,
}: RadioInputProps) => {
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
        defaultValue={defaultValue}
        name={name}
        render={({ field }) => (
          <RadioGroup
            color={color}
            errorMessage={error}
            isDisabled={disabled}
            isInvalid={!!error}
            value={String(field.value)}
            onValueChange={field.onChange}
          >
            {options.map(opt => (
              <Radio
                key={String(opt.value)}
                description={opt.description}
                value={String(opt.value)}
              >
                {opt.label}
              </Radio>
            ))}
          </RadioGroup>
        )}
      />
    </FormFieldWrapper>
  );
};
