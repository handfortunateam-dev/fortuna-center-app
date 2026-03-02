"use client";

import { useParams } from "next/navigation";
import { ChangeLogForm } from "@/features/change-logs/forms/ChangeLogForm";
import { useChangeLog } from "@/features/change-logs/services/changeLogsService";
import { LoadingScreen } from "@/components/loading/LoadingScreen";
import { StateMessage } from "@/components/state-message";

export default function EditChangeLogPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: changelog, isLoading, isError } = useChangeLog(id);

  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  if (isError || !changelog) {
    return (
      <StateMessage
        type="notFound"
        icon="lucide:alert-circle"
        title="Changelog Not Found"
        message="The changelog you're looking for doesn't exist or has been deleted."
      />
    );
  }

  return <ChangeLogForm mode="edit" changelog={changelog} />;
}
