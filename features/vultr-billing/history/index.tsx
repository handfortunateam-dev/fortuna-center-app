"use client";

import React, { useEffect, useState } from "react";
import { ListGrid } from "@/components/table";
import { columnsBillingHistory } from "./columns";
import { BillingItem } from "../interfaces";

export default function BillingHistoryList() {
  const [data, setData] = useState<BillingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/vultr/billing");
        if (!response.ok) {
          throw new Error("Failed to fetch billing data");
        }
        const result = await response.json();
        setData(result.billing_history || []);
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
      title="Vultr Billing History"
      description="View your billing history and transactions from Vultr."
      data={data}
      loading={loading}
      isError={isError}
      error={error}
      onSearch={() => {}}
      columns={columnsBillingHistory as never}
      pageSize={10}
      showPagination
      searchPlaceholder="Search billing history..."
    />
  );
}
