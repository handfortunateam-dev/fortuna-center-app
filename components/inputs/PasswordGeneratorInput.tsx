"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs/TextInput";

interface PasswordGeneratorInputProps {
  required?: boolean;
}

export const PasswordGeneratorInput = ({
  required = true,
}: PasswordGeneratorInputProps) => {
  const { setValue } = useFormContext();
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);

  const generatePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setValue("password", retVal, { shouldValidate: true });
    setValue("confirmPassword", retVal, { shouldValidate: true });
    setGeneratedPass(retVal);

    // Auto-hide the generated password display after 10 seconds
    setTimeout(() => {
      setGeneratedPass(null);
    }, 10000);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <label className="font-medium text-sm text-gray-900 dark:text-gray-100">
          Password
          {required && (
            <span className="text-red-500 dark:text-red-400 ml-0.5">*</span>
          )}
        </label>
        <Button
          size="sm"
          variant="light"
          color="primary"
          className="h-6 px-2 text-xs"
          startContent={<Icon icon="lucide:key-round" width={14} />}
          onPress={generatePassword}
        >
          Generate Secure Password
        </Button>
      </div>

      {generatedPass && (
        <div className="bg-success-50 p-2 rounded-md border border-success-200 text-sm flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:check-circle" className="text-success-600" />
            <span className="text-success-700">
              Generated: <strong className="font-mono">{generatedPass}</strong>
            </span>
          </div>
          <Tooltip content="Copy to clipboard">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="h-6 w-6 min-w-6"
              onPress={() => {
                navigator.clipboard.writeText(generatedPass);
              }}
            >
              <Icon
                icon="lucide:copy"
                className="text-success-600"
                width={14}
              />
            </Button>
          </Tooltip>
        </div>
      )}

      <TextInput
        name="password"
        type="password"
        placeholder="Enter password"
        required={required}
        validation={{
          required: required ? "Password is required" : false,
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
        }}
      />
    </div>
  );
};
