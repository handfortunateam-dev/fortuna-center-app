"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { OptionsMenuItem } from "./types";

interface OptionsMenuProps {
  optionsMenu: OptionsMenuItem[];
  customOptions: OptionsMenuItem[];
  additionalOptions: OptionsMenuItem[];
  enableImport: boolean;
  enableExport: boolean;
  onImport?: () => void;
  onExport?: () => void;
  exportResourcePath?: string;
  resourcePath?: string;
}

export function OptionsMenu({
  optionsMenu,
  customOptions,
  additionalOptions,
  enableImport,
  enableExport,
  onImport,
  onExport,
  exportResourcePath,
  resourcePath,
}: OptionsMenuProps) {
  const router = useRouter();

  const allOptions: OptionsMenuItem[] = optionsMenu ? [...optionsMenu] : [];

  if (customOptions && customOptions.length > 0) {
    allOptions.push(...customOptions);
  }

  if (additionalOptions && additionalOptions.length > 0) {
    allOptions.unshift(...additionalOptions);
  }

  if (enableImport) {
    allOptions.unshift({
      key: "import",
      label: "Import",
      icon: <Icon icon="lucide:upload" className="w-6 h-6" />,
      onPress:
        onImport ||
        (() => {
          const targetPath = exportResourcePath || resourcePath;
          if (targetPath) {
            const resource = targetPath.replace(/^\//, "");
            router.push(`/${resource}/import`);
          } else {
            Toast({
              title: "Error",
              description:
                "Resource path tidak konfigurasikan untuk auto-import",
              color: "danger",
            });
          }
        }),
    });
  }

  if (enableExport) {
    allOptions.unshift({
      key: "export",
      label: "Export",
      icon: <Icon icon="lucide:download" className="w-6 h-6" />,
      onPress:
        onExport ||
        (async () => {
          const targetPath = exportResourcePath || resourcePath;
          if (!targetPath) {
            Toast({
              title: "Error",
              description: "Resource path tidak ditemukan untuk auto-export",
              color: "danger",
            });
            return;
          }
          try {
            Toast({
              title: "Processing",
              description: "Mempersiapkan data export...",
              color: "primary",
            });

            const response = await fetch(`/api/export${targetPath}`);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message || "Gagal melakukan export data",
              );
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const fileName = `${targetPath.replace(/^\//, "")}-export-${new Date().toISOString().split("T")[0]}.csv`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            Toast({
              title: "Success",
              description: "Data berhasil diexport",
              color: "success",
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat export";
            Toast({
              title: "Error",
              description: errorMessage,
              color: "danger",
            });
          }
        }),
    });
  }

  if (allOptions.length === 0) return null;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="lg" variant="light">
          <Icon icon="lucide:ellipsis-vertical" className="w-6 h-6" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Options menu"
        onAction={(key) => {
          const menuItem = allOptions.find((item) => item.key === key);
          if (menuItem && menuItem.onPress) {
            menuItem.onPress();
          }
        }}
      >
        {allOptions.map((item) => (
          <DropdownItem
            key={item.key}
            color={item.color}
            startContent={item.icon}
            variant={item.variant}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
