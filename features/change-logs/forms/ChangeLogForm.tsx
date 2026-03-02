"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Changelog, CreateChangelogPayload } from "../interfaces";
import {
  useCreateChangeLog,
  useUpdateChangeLog,
} from "../services/changeLogsService";
import { Toast } from "@/components/toast";
import { useEffect } from "react";
import { Container } from "@/components/container";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { TextInput } from "@/components/inputs/TextInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { SwitchInput } from "@/components/inputs/SwitchInput";
import { LoadingScreen } from "@/components/loading/LoadingScreen";

interface ChangeLogFormProps {
  mode: "create" | "edit";
  changelog?: Changelog;
}

const TYPE_OPTIONS = [
  { label: "Feature", value: "FEATURE" },
  { label: "Bug Fix", value: "BUG_FIX" },
  { label: "Improvement", value: "IMPROVEMENT" },
  { label: "Update", value: "UPDATE" },
];

export function ChangeLogForm({ mode, changelog }: ChangeLogFormProps) {
  const router = useRouter();
  const isEditing = mode === "edit";

  const methods = useForm<CreateChangelogPayload>({
    defaultValues: {
      title: "",
      content: "",
      type: "FEATURE",
      version: "",
      isPublished: false,
    },
  });

  const { mutateAsync: createLog } = useCreateChangeLog();
  const { mutateAsync: updateLog } = useUpdateChangeLog();

  useEffect(() => {
    if (isEditing && changelog) {
      methods.reset({
        title: changelog.title,
        content: changelog.content,
        type: changelog.type,
        version: changelog.version,
        isPublished: changelog.isPublished,
      });
    }
  }, [isEditing, changelog, methods]);

  const onSubmit = async (data: CreateChangelogPayload) => {
    try {
      if (isEditing && changelog) {
        await updateLog({ id: changelog.id, payload: data });
        Toast({ title: "Changelog updated successfully", color: "success" });
      } else {
        await createLog(data);
        Toast({ title: "Changelog created successfully", color: "success" });
      }
      router.push("/change-logs");
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      Toast({
        title:
          error.response?.data?.message ||
          error.message ||
          `Failed to ${isEditing ? "update" : "create"} changelog`,
        color: "danger",
      });
    }
  };

  const {
    formState: { isSubmitting },
  } = methods;

  return (
    <>
      <LoadingScreen isLoading={isSubmitting} />
      <Container className="py-6">
        <div className="mb-6">
          <Heading as="h1" size="2xl">
            {isEditing ? "Edit Changelog" : "Create New Changelog"}
          </Heading>
          <Text size="sm" color="muted" className="mt-1">
            {isEditing
              ? "Update the changelog details"
              : "Add a new update to the changelog"}
          </Text>
        </div>

        <CreateOrEditFormWrapper<CreateChangelogPayload>
          onSubmit={onSubmit}
          mode={mode}
          methods={methods}
          backPath="/change-logs"
        >
          <TextInput
            name="title"
            label="Title"
            placeholder="Enter changelog title"
            required
            validation={{ required: "Title is required" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput
              name="type"
              label="Type"
              placeholder="Select type"
              required
              options={TYPE_OPTIONS}
              validation={{ required: "Type is required" }}
            />

            <TextInput
              name="version"
              label="Version"
              placeholder="e.g. 1.0.0"
              required
              validation={{ required: "Version is required" }}
            />
          </div>

          <TextareaInput
            name="content"
            label="Content"
            placeholder="Describe the changes..."
            required
            minRows={8}
          />

          <SwitchInput
            name="isPublished"
            label="Publish"
            description="Publish immediately — make this changelog visible to users right away"
          />
        </CreateOrEditFormWrapper>
      </Container>
    </>
  );
}
