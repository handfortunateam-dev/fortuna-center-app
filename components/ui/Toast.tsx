import { addToast } from "@heroui/toast";

type ToastColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger";
type ToastVariant = "solid" | "bordered" | "flat";

// 

interface ShowToastOptions {
  title?: string;
  description?: string;
  color: ToastColor;
  variant?: ToastVariant;

  timeout?: number;
  shouldShowTimeoutProgress?: boolean;
}

/**
 * Wrapper untuk menampilkan toast dengan default value dan style.
 */
export function Toast({
  title = "Notifikasi",
  description,
  variant = "solid",
  color,
  timeout = 3000,
  shouldShowTimeoutProgress = true
}: ShowToastOptions) {
  // Map custom ToastColor to accepted color values
  // const colorMap: Record<
  //   ToastColor,
  //   "success" | "warning" | "danger" | "primary"
  // > = {
  //   success: "success",
  //   error: "danger",
  //   warning: "warning",
  //   info: "primary",
  // };

  addToast({
    title,
    description,
    variant,
    color,
    timeout,
    shouldShowTimeoutProgress,
  });
}