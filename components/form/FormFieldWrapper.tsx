interface FormFieldWrapperProps {
  label?: string;
  name: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const FormFieldWrapper = ({
  label,
  name,
  required,
  error,
  helperText,
  children,
}: FormFieldWrapperProps) => {
  const labelId = `${name}-label`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="font-medium text-sm text-gray-900 dark:text-gray-100" htmlFor={name} id={labelId}>
          {label}
          {required && <span className="text-red-500 dark:text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};
