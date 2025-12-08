import { NumberInput as HeroNumberInput } from "@heroui/react";
import { useFormContext, Controller } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface NumberInputProps {
  name: string;
  label?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export const NumberInput = ({
  name,
  label,
  min,
  max,
  disabled = false,
  required = true,
  placeholder,
  description
}: NumberInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <FormFieldWrapper label={label} name={name} required={required}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <HeroNumberInput
            aria-label={label}
            classNames={{
              input: "dark:text-white",
              inputWrapper: "dark:bg-gray-800 dark:border-gray-700",
              label: "dark:text-gray-300",
              description: "dark:text-gray-400",
            }}
            description={description}
            errorMessage={error}
            isDisabled={disabled}
            isInvalid={!!error}
            isRequired={required}
            maxValue={max}
            minValue={min}
            placeholder={placeholder}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
    </FormFieldWrapper>
  );
};
