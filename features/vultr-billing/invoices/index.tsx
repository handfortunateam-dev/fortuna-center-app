"use client";

import React, { useEffect, useState } from "react";
import { ListGrid } from "@/components/table";
import { columnsInvoices } from "./columns";
import { InvoiceItem } from "../interfaces";

export default function InvoicesList() {
  const [data, setData] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/vultr/invoices");
        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const result = await response.json();
        setData(result.billing_invoices || []);
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
      title="Vultr Invoices"
      description="View your billing invoices from Vultr."
      data={data}
      loading={loading}
      isError={isError}
      error={error}
      onSearch={() => {}}
      columns={columnsInvoices as never}
      pageSize={10}
      showPagination
      searchPlaceholder="Search invoices..."
    />
  );
}
