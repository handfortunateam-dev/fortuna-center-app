"use client";

import React from "react";
import StorageQuotaWidget from "../podcast/StorageQuotaWidget";
import { PageHeader } from "@/components/ui/Common/PageHeader";

export default function StorageQuotaPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        title="Storage Quota"
        description="Monitor your station's storage usage."
      />
      <div className="max-w-md">
        <StorageQuotaWidget isFloating={false} />
      </div>
    </div>
  );
}
