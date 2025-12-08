"use client";

import { Input } from "@heroui/react";
import { Controller, useFormContext } from "react-hook-form";

import { FormFieldWrapper } from "../Form/FormFieldWrapper";

interface OTPInputProps {
  name: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  length?: number;
}

export const OTPInput = ({
  name,
  label,
  disabled = false,
  required = true,
  length = 6,
}: OTPInputProps) => {
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
          <div className="flex gap-2">
            {Array.from({ length }).map((_, index) => {
              const value = field.value?.[index] || "";

              return (
                <Input
                  key={index}
                  classNames={{
                    input: "text-center text-lg font-semibold",
                    inputWrapper: "h-12 w-12",
                  }}
                  id={`${name}-${index}`}
                  isDisabled={disabled}
                  isInvalid={!!error}
                  isRequired={required}
                  maxLength={1}
                  type="text"
                  value={value}
                  onChange={e => {
                    const newValue = e.target.value;

                    if (!/^\d*$/.test(newValue)) return; // Only allow digits

                    const currentOTP = (field.value || "").split("");

                    currentOTP[index] = newValue;

                    const newOTP = currentOTP.join("");

                    field.onChange(newOTP);

                    // Auto-focus next input
                    if (newValue && index < length - 1) {
                      const nextInput = document.getElementById(
                        `${name}-${index + 1}`
                      );

                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={e => {
                    // Handle backspace
                    if (e.key === "Backspace" && !value && index > 0) {
                      const prevInput = document.getElementById(
                        `${name}-${index - 1}`
                      );

                      prevInput?.focus();
                    }
                  }}
                />
              );
            })}
          </div>
        )}
      />
    </FormFieldWrapper>
  );
};
