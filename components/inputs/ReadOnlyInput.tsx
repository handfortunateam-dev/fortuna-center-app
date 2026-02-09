import React from "react";

interface ReadOnlyInputProps {
  label?: string;
  value?: string | React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const ReadOnlyInput = ({
  label,
  value,
  placeholder = "-",
  className = "",
}: ReadOnlyInputProps) => {
  const isEmpty =
    typeof value === "string"
      ? value.trim().length === 0
      : value === null || value === undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div
        className={`w-full rounded-md border border-default-200 bg-default-100 px-3 py-2 text-sm 
        ${isEmpty ? "text-default-400 italic" : "text-foreground"}`}
      >
        {isEmpty ? placeholder : value}
      </div>
    </div>
  );
};
