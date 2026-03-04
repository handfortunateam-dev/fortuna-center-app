"use client";

import { ListGrid } from "@/components/table";
import { registrationColumns } from "@/features/registration/columns";
import { Registration } from "@/features/registration/interfaces";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

export default function RegistrationsPage() {
  const router = useRouter();

  return (
    <ListGrid
      title="Self Registrations"
      columns={registrationColumns}
      enableSearch
      enableCreate={false}
      enableShow={true}
      enableDelete={false}
      resourcePath="/registrations"
      searchPlaceholder="Search registrations..."
      serverSide={false}
      paginationType="page"
      pageSize={20}
      

      onRowClick={(item: Registration) =>
        router.push(`/registrations/${item.id}`)
      }
      filters={[
        {
          key: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Reviewed", value: "reviewed" },
            { label: "Accepted", value: "accepted" },
            { label: "Rejected", value: "rejected" },
          ],
        },
      ]}
      additionalOptions={[
        {
          key: "manage_links",
          label: "Manage Links",
          icon: <Icon icon="lucide:link" className="w-5 h-5" />,
          onPress: () => router.push("/registration-links"),
        },
      ]}
    />
  );
}
