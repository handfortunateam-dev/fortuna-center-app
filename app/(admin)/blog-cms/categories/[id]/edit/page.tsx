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
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { apiClient } from "@/lib/axios";
import { Toast } from "@/components/toast";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = React.use(params);

  // Fetch Category
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["blog-category", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: CategoryFormValues }>(
        `/blog-cms/categories/${id}`,
      );
      return data.data;
    },
  });

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const { reset } = methods;

  // Set default values when data is loaded
  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description || "",
      });
    }
  }, [categoryData, reset]);

  const mutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const { data } = await apiClient.patch(
        `/blog-cms/categories/${id}`,
        values,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/blog-cms/categories"] });
      queryClient.invalidateQueries({ queryKey: ["blog-category", id] });
      Toast({
        title: "Success",
        description: "Category updated successfully",
        color: "success",
      });
      router.push("/blog-cms/categories");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "Failed to update category",
        color: "danger",
      });
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
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
          Edit Category
        </Heading>
        <Text color="muted">Update category details.</Text>
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
                placeholder="e.g. Technology"
                required
              />

              <TextInput
                name="slug"
                label="Slug"
                placeholder="e.g. technology"
                description="URL friendly identifier (Read-only)."
                disabled={true}
                required
              />

              <TextareaInput
                name="description"
                label="Description"
                placeholder="Category description..."
                required={false}
              />
            </div>
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
