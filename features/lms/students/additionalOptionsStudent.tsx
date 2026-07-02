import React from "react";
import { OptionsMenuItem } from "@/components/table";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Icon } from "@iconify/react";

interface GetAdditionalOptionsProps {
  router: AppRouterInstance;
  setIsExportModalOpen: (isOpen: boolean) => void;
}

export const getAdditionalOptionsStudent = ({
  router,
  setIsExportModalOpen,
}: GetAdditionalOptionsProps): OptionsMenuItem[] => [
  {
    key: "analytics_students",
    label: "Analytics",
    icon: <Icon icon="lucide:chart-bar" className="w-6 h-6" />,
    onPress: () => {
      router.push("/analytics/users");
    },
  },
  {
    key: "bulk_update",
    label: "Bulk Update",
    icon: <Icon icon="lucide:edit" className="w-6 h-6" />,
    onPress: () => {
      router.push("/students/bulk-update");
    },
  },
  {
    key: "custom_export",
    label: "Export Data",
    icon: <Icon icon="lucide:download" className="w-6 h-6" />,
    onPress: () => {
      setIsExportModalOpen(true);
    },
  },
  {
    key: "bulk_promote",
    label: "Bulk Promote",
    icon: <Icon icon="solar:rocket-bold" className="w-6 h-6" />,
    onPress: () => {
      router.push("/students/bulk-promote");
    },
  },
];
