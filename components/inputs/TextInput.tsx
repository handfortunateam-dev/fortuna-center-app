import { Input, type InputProps } from "@heroui/react";
import {
  useFormContext,
  type RegisterOptions,
  Controller,
} from "react-hook-form";
import { useState, MouseEvent, ReactNode } from "react";
// import { Eye, EyeOff } from "lucide-react";
import { Icon } from "@iconify/react";
import { clsx, type ClassValue } from "clsx"; // Added import

import { FormFieldWrapper } from "../form/FormFieldWrapper";

interface TextInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "date";
  validation?: RegisterOptions;
  helperText?: string;
  description?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  classNames?: InputProps["classNames"];
  labelPlacement?: InputProps["labelPlacement"];
  defaultValue?: string | number;
}

export const TextInput = ({
  name,
  label,
  placeholder,
  disabled = false,
  required = true,
  type = "text",
  isInvalid = false,
  errorMessage,
  validation,
  helperText,
  description,
  startContent,
  endContent,
  classNames,
  labelPlacement = "outside",
  defaultValue, // Accept defaultValue prop
}: TextInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  // Local state for toggling password visibility
  const [show, setShow] = useState(false);

  const isPassword = type === "password";

  const toggleShow = (e: MouseEvent) => {
    // Prevent the toggle button from submitting forms when inside a form
    e.preventDefault();
    setShow((prev) => !prev);
  };

  const mergeClassNames = (base: string, extra?: ClassValue) =>
    clsx(base, extra);

  const mergedClassNames: InputProps["classNames"] = {
    input: mergeClassNames("dark:text-white", classNames?.input),
    inputWrapper: mergeClassNames(
      "dark:bg-gray-800 dark:border-gray-700",
      classNames?.inputWrapper,
    ),
    label: mergeClassNames("dark:text-gray-300", classNames?.label),
    description: mergeClassNames("dark:text-gray-400", classNames?.description),
    helperWrapper: classNames?.helperWrapper,
    innerWrapper: classNames?.innerWrapper,
    mainWrapper: classNames?.mainWrapper,
  };

  const renderPasswordToggle = () =>
    isPassword ? (
      <button
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        className="inline-flex items-center justify-center p-1 text-gray-600 dark:text-gray-400"
        type="button"
        onClick={toggleShow}
      >
        {show ? (
          <Icon icon="lucide:eye-off" className="w-4 h-4" />
        ) : (
          <Icon icon="lucide:eye" className="w-4 h-4" />
        )}
      </button>
    ) : null;

  const combinedEndContent = isPassword ? (
    <div className="flex items-center gap-1">
      {endContent}
      {renderPasswordToggle()}
    </div>
  ) : (
    endContent
  );

  return (
    <FormFieldWrapper
      helperText={helperText}
      label={label}
      name={name}
      required={required}
    >
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue ?? ""} // Use provided defaultValue or empty string
        render={({ field }) => (
          <Input
            classNames={mergedClassNames}
            description={description}
            endContent={combinedEndContent}
            errorMessage={error}
            id={name}
            isDisabled={disabled}
            isInvalid={!!error || isInvalid}
            isRequired={required}
            labelPlacement={labelPlacement}
            name={field.name}
            placeholder={placeholder}
            startContent={startContent}
            type={isPassword && show ? "text" : type}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
        rules={validation}
      />
    </FormFieldWrapper>
  );
};
