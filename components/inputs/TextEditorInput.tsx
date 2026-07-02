"use client";

import {
  Controller,
  useFormContext,
  type RegisterOptions,
} from "react-hook-form";
import TextEditor from "@/components/editor/TextEditor";
import { FormFieldWrapper } from "../form/FormFieldWrapper";

interface TextEditorInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: RegisterOptions;
  helperText?: string;
  className?: string;
}

export const TextEditorInput = ({
  name,
  label,
  placeholder,
  required = true,
  validation,
  helperText,
  className,
}: TextEditorInputProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <FormFieldWrapper
      helperText={helperText}
      label={label}
      name={name}
      required={required}
      error={error}
    >
      <div className="bg-white text-black rounded-xl overflow-hidden border border-default-200 focus-within:ring-2 ring-primary/50 transition-all min-h-[400px]">
        <Controller
          control={control}
          name={name}
          rules={validation}
          render={({ field }) => (
            <TextEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={placeholder}
              className={className ?? "min-h-[350px]"}
            />
          )}
        />
      </div>
    </FormFieldWrapper>
  );
};
