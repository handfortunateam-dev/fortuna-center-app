"use client";

import { Button } from "@heroui/react";
import { ReactNode } from "react";

interface FormActionsProps {
  onReset?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  resetLabel?: string;
  backLabel?: string;
  showBackButton?: boolean;
  backHref?: string; // opsional: custom halaman kembali
  extraActions?: ReactNode;
}

export default function FormActions({
  onReset,
  isSubmitting = false,
  submitLabel = "Simpan",
  resetLabel = "Reset",
  backLabel = "Kembali",
  showBackButton = true,
  backHref,
  extraActions,
}: FormActionsProps) {
  const handleBack = () => {
    if (backHref) {
      window.location.href = backHref;
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {showBackButton && (
        <Button type="button" variant="shadow" onPress={handleBack}>
          {backLabel}
        </Button>
      )}
      {onReset && (
        <Button type="button" variant="bordered" onPress={onReset}>
          {resetLabel}
        </Button>
      )}
      {extraActions}
      <Button color="primary" isLoading={isSubmitting} type="submit">
        {submitLabel}
      </Button>
    </>
  );
}
