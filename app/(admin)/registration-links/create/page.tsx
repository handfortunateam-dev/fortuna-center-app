"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { Toast } from "@/components/toast/index";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { RegistrationLinkForm } from "@/features/registration/forms/RegistrationLinkForm";
import { CreateRegistrationLinkPayload } from "@/features/registration/interfaces";
import { useCreateRegistrationLink } from "@/features/registration/services/registrationService";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

export default function CreateRegistrationLinkPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: createLink, isPending } = useCreateRegistrationLink();

  const defaultValues: Partial<CreateRegistrationLinkPayload> = {
    slug: "",
    label: "",
    description: "",
    isActive: true,
  };

  const handleCreate = async (data: CreateRegistrationLinkPayload) => {
    setError(null);
    try {
      await createLink(data);

      Toast({
        title: "Success",
        description: "Registration link created successfully",
        color: "success",
      });

      router.push("/registration-links");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      Toast({ title: "Error", description: message, color: "danger" });
      throw err;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <LoadingScreen isLoading={isPending} />
      <Card>
        <CardHeader className="flex flex-col items-start px-6 py-6 border-b border-default-200">
          <Heading size="lg">Create Registration Link</Heading>
          <Text size="sm" color="muted">
            Create a new registration link for public enrollment forms
          </Text>
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
            onSubmit={handleCreate}
            defaultValues={defaultValues}
            mode="create"
          >
            <RegistrationLinkForm mode="create" />
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
