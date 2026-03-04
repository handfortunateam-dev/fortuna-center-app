"use client";

import { useFormContext } from "react-hook-form";
import { TextInput } from "@/components/inputs/TextInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { CreateRegistrationLinkPayload } from "../interfaces";

interface Props {
  mode: "create" | "edit";
}

export function RegistrationLinkForm({ mode }: Props) {
  const { watch, setValue } = useFormContext<CreateRegistrationLinkPayload>();
  const label = watch("label") ?? "";

  // Auto-generate slug from label on create mode
  const handleLabelBlur = () => {
    if (mode !== "create") return;
    const autoSlug = label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", autoSlug);
  };

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        name="label"
        label="Label"
        placeholder="e.g., Pintu Masuk Utama, Brosur 2025"
        required
        validation={{ required: "Label is required" }}
        onBlur={handleLabelBlur}
      />

      <TextInput
        name="slug"
        label="Slug"
        placeholder="e.g., main-entrance, brosur-2025"
        required
        validation={{
          required: "Slug is required",
          pattern: {
            value: /^[a-z0-9-]+$/,
            message:
              "Slug can only contain lowercase letters, numbers, and hyphens",
          },
        }}
        description="Used in the registration URL: /register/{slug}"
      />

      <TextareaInput
        name="description"
        label="Description"
        placeholder="Optional notes about this link"
        minRows={2}
        required={false}
      />

      <SelectInput
        name="isActive"
        label="Status"
        placeholder="Select status"
        options={[
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ]}
        required={false}
      />
    </div>
  );
}
