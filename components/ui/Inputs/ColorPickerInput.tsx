import { Input } from "@heroui/react";
import { useFormContext, RegisterOptions, Controller } from "react-hook-form";
import { useState } from "react";
// import { Pipette } from "lucide-react";
import { Icon } from "@iconify/react";
import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface ColorPickerInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  validation?: RegisterOptions;
  helperText?: string;
}

export const ColorPickerInput = ({
  name,
  label,
  placeholder = "#000000",
  disabled = false,
  required = true,
  validation,
  helperText,
}: ColorPickerInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;
  const [localColor, setLocalColor] = useState("#000000");

  // Default validation rules for hex color
  const defaultValidation = {
    required: required ? "Color is required" : false,
    pattern: {
      value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      message: "Please enter a valid hex color (e.g., #FF5733)",
    },
    ...validation,
  } as RegisterOptions;

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      required={required}
      helperText={helperText}
    >
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const currentColor = field.value || localColor;

          return (
            <div className="flex gap-2 items-center">
              {/* Color preview swatch */}
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: currentColor }}
                  title={`Current color: ${currentColor}`}
                />
                <Icon icon="lucide:pipette" className="absolute -top-1 -right-1 w-4 h-4 text-gray-600 pointer-events-none" />
              </div>

              {/* Hex color text input */}
              <div className="flex-1">
                <Input
                  {...field}
                  errorMessage={error}
                  id={name}
                  isDisabled={disabled}
                  isInvalid={!!error}
                  isRequired={required}
                  labelPlacement="outside"
                  placeholder={placeholder}
                  type="text"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);

                    // Update local color preview if valid hex
                    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                      setLocalColor(value);
                    }
                  }}
                  startContent={
                    <span className="text-gray-500 text-sm font-mono">#</span>
                  }
                  classNames={{
                    input: "font-mono",
                  }}
                />
              </div>

              {/* Native color picker (hidden but functional) */}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => {
                  const hexColor = e.target.value.toUpperCase();
                  field.onChange(hexColor);
                  setLocalColor(hexColor);
                }}
                disabled={disabled}
                className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300"
                title="Pick a color"
              />
            </div>
          );
        }}
        rules={defaultValidation}
      />
    </FormFieldWrapper>
  );
};
