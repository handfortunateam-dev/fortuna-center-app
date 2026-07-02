"use client";

import React, { useEffect, useState } from "react";
import { ListGrid } from "@/components/table";
import { columnsPendingCharges } from "./columns";
import { PendingChargeItem } from "../interfaces";

export default function PendingChargesList() {
  const [data, setData] = useState<PendingChargeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/vultr/pending-charges");
        if (!response.ok) {
          throw new Error("Failed to fetch pending charges");
        }
        const result = await response.json();
        setData(result.pending_charges || []);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err : new Error("An error occurred"),
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <ListGrid
      keyField="id"
      idField="id"
      nameField="description"
      title="Vultr Pending Charges"
      description="View your pending charges from Vultr. These will be applied to your next invoice."
      data={data}
      loading={loading}
      isError={isError}
      error={error}
      onSearch={() => {}}
      columns={columnsPendingCharges as never}
      pageSize={10}
      showPagination
      searchPlaceholder="Search pending charges..."
    />
  );
}
