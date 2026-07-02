"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
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

type TagDetail = {
  id: string;
  name: string;
  slug: string;
};

export default function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = React.use(params);

  const { data: tag, isLoading } = useQuery({
    queryKey: ["blog-tag", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TagDetail }>(
        `/blog-cms/tags/${id}`,
      );
      return data.data;
    },
  });

  const methods = useForm<TagFormValues>({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
        slug: tag.slug,
      });
    }
  }, [tag, reset]);

  // Auto-generate slug from name if slug hasn't been manually modified

  const mutation = useMutation({
    mutationFn: async (values: TagFormValues) => {
      const { data } = await apiClient.patch(`/blog-cms/tags/${id}`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/blog-cms/tags"] });
      queryClient.invalidateQueries({ queryKey: ["blog-tag", id] });
      Toast({
        title: "Success",
        description: "Tag updated successfully",
        color: "success",
      });
      router.push("/blog-cms/tags");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "Failed to update tag",
        color: "danger",
      });
    },
  });

  const onSubmit = (data: TagFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
          Edit Tag
        </Heading>
        <Text color="muted">Update tag details.</Text>
      </div>

      <Card className="p-6">
        <CardBody>
          <CreateOrEditFormWrapper
            methods={methods}
            onSubmit={onSubmit}
            mode="edit"
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
                description="URL friendly identifier (Read-only)."
                disabled={true}
                required
              />
            </div>
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
