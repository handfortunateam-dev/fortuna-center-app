"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { TextInput } from "@/components/inputs/TextInput";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
});

type TagFormValues = z.infer<typeof tagSchema>;

export default function CreateTagPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<TagFormValues>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const {
    watch,
    setValue,
    formState: { dirtyFields },
  } = methods;
  const watchedName = watch("name");

  // Auto-generate slug from name if slug hasn't been manually modified
  useEffect(() => {
    if (watchedName && !dirtyFields.slug) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // replace spaces with hyphens
        .replace(/-+/g, "-"); // prevent multiple hyphens
      setValue("slug", slug);
    }
  }, [watchedName, dirtyFields.slug, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: TagFormValues) => {
      const { data } = await apiClient.post("/blog-cms/tags", values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/blog-cms/tags"] });
      Toast({
        title: "Success",
        description: "Tag created successfully",
        color: "success",
      });
      router.push("/blog-cms/tags");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        color: "danger",
      });
    },
  });

  const onSubmit = (data: TagFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="light"
          startContent={<Icon icon="solar:arrow-left-linear" />}
          onPress={() => router.back()}
        >
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <Heading size="3xl" weight="bold">
          Create New Tag
        </Heading>
        <Text color="muted">Add a new tag for blog posts.</Text>
      </div>

      <Card className="p-6">
        <CardBody>
          <CreateOrEditFormWrapper
            methods={methods}
            onSubmit={onSubmit}
            mode="create"
          >
            <div className="space-y-4">
              <TextInput
                name="name"
                label="Name"
                placeholder="e.g. Tutorial"
                required
              />

              <TextInput
                name="slug"
                label="Slug"
                placeholder="e.g. tutorial"
                description="URL friendly identifier. Auto-generated from name."
                required
              />
            </div>
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
