"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast/index";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { RegistrationLinkForm } from "@/features/registration/forms/RegistrationLinkForm";
import { CreateRegistrationLinkPayload } from "@/features/registration/interfaces";
import {
  useRegistrationLink,
  useUpdateRegistrationLink,
} from "@/features/registration/services/registrationService";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditRegistrationLinkPage({ params }: EditPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: link, isLoading, isError } = useRegistrationLink(id);
  const { mutateAsync: updateLink } = useUpdateRegistrationLink();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (data: CreateRegistrationLinkPayload) => {
    setError(null);
    try {
      await updateLink({ id, payload: data });

      Toast({
        title: "Updated",
        description: "Registration link updated successfully",
        color: "success",
      });

      setTimeout(() => {
        router.push("/registration-links");
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      Toast({ title: "Error", description: message, color: "danger" });
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <SkeletonCard variant="edit" />
      </div>
    );
  }

  if (isError || !link) {
    return <StateMessage message="Registration Link Not Found" />;
  }

  const defaultValues: Partial<CreateRegistrationLinkPayload> = {
    slug: link.slug,
    label: link.label,
    description: link.description ?? "",
    isActive: link.isActive,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-6 border-b border-default-200">
          <h1 className="text-2xl font-bold">Edit Registration Link</h1>
          <p className="text-sm text-default-500 mt-1">
            Update link details for{" "}
            <code className="text-primary font-mono">{link.slug}</code>
          </p>
        </CardHeader>
        <CardBody className="p-6">
          {error && (
            <div className="flex gap-2 items-start bg-danger-50 border border-danger-200 rounded-lg p-3 mb-6">
              <Icon
                icon="lucide:alert-circle"
                className="w-5 h-5 text-danger-600 shrink-0 mt-0.5"
              />
              <p className="text-sm text-danger-800">{error}</p>
            </div>
          )}

          <CreateOrEditFormWrapper<CreateRegistrationLinkPayload>
            onSubmit={handleUpdate}
            defaultValues={defaultValues}
            mode="edit"
          >
            <RegistrationLinkForm mode="edit" />
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
