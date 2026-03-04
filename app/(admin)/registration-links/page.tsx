"use client";

import { ListGrid } from "@/components/table";
import { registrationLinkColumns } from "@/features/registration/columns";
import { RegistrationLink } from "@/features/registration/interfaces";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function RegistrationLinksPage() {
  const router = useRouter();

  return (
    <ListGrid
      title="Registration Links"
      columns={registrationLinkColumns}
      enableSearch
      enableShow={false}
      enableEdit
      resourcePath="/registration-links"
      searchPlaceholder="Search links..."
      serverSide={false}
      paginationType="page"
      pageSize={20}
      actionButtons={{
        custom: [
          {
            key: "open_form",
            label: "Open Form",
            isIconOnly: true,
            icon: <Icon icon="lucide:external-link" className="w-5 h-5" />,
            color: "primary",
            // onClick receives (id: string, item?: unknown)
            // id = UUID, item = full row object containing slug
            onClick: (_id: string, item?: unknown) => {
              const link = item as RegistrationLink;
              if (link?.slug) {
                router.replace(`/r/${link.slug}`);
              }
            },
          },
        ],
      }}
    />
  );
}
