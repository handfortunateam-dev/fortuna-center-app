"use client";

import type { FormSchema, FormSection } from "@/interfaces/form-fields";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

import { Separator } from "../Separator";

import { FormFieldRenderer } from "./FormFieldRenderer";

interface FormBuilderProps {
  /**
   * Form schema containing sections and fields
   */
  schema: FormSchema;

  /**
   * Optional className for the form container
   */
  className?: string;

  /**
   * Whether to show section separators
   * @default true
   */
  showSeparators?: boolean;
}

/**
 * FormBuilder - Renders an entire form based on a schema
 * This is the main component you'll use to render forms automatically
 */
export function FormBuilder({
  schema,
  className,
  showSeparators = true,
}: FormBuilderProps) {
  return (
    <div className={className}>
      {schema.sections.map((section, sectionIndex) => (
        <FormSectionRenderer
          key={sectionIndex}
          section={section}
          showSeparator={showSeparators && sectionIndex > 0}
        />
      ))}
    </div>
  );
}

interface FormSectionRendererProps {
  section: FormSection;
  showSeparator: boolean;
}

function FormSectionRenderer({
  section,
  showSeparator,
}: FormSectionRendererProps) {
  const { watch } = useFormContext();
  const formValues = watch();

  // Check if section should be shown based on condition
  const shouldShow = useMemo(() => {
    if (!section.condition) return true;

    return section.condition(formValues);
  }, [section.condition, formValues]);

  if (!shouldShow) return null;

  // Calculate grid columns class
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[section.columns ?? 1];

  return (
    <div className="space-y-4">
      {showSeparator && <Separator className="my-6" />}

      {/* Section header */}
      {(section.title || section.description) && (
        <div className="space-y-1 mb-4">
          {section.title && (
            <h3 className="text-lg font-semibold text-foreground">
              {section.title}
            </h3>
          )}
          {section.description && (
            <p className="text-sm text-default-500">{section.description}</p>
          )}
        </div>
      )}

      {/* Fields grid */}
      <div className={`grid ${gridColsClass} gap-4`}>
        {section.fields.map(field => {
          // Calculate column span class
          const colSpanClass = field.colSpan
            ? {
                1: "col-span-1",
                2: "col-span-1 md:col-span-2",
                3: "col-span-1 md:col-span-2 lg:col-span-3",
                4: "col-span-1 md:col-span-2 lg:col-span-4",
                6: "col-span-1 md:col-span-2 lg:col-span-6",
                12: "col-span-full",
              }[field.colSpan]
            : "col-span-1";

          return (
            <FormFieldRenderer
              key={field.name}
              className={`${colSpanClass} ${field.className || ""}`}
              field={field}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FormBuilder;
