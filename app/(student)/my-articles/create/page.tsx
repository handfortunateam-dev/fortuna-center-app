"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { CreateOrEditFormWrapper } from "@/components/form/CreateOrEditFormWrapper";
import { uploadFileToFirebase } from "@/services/storageService";
import { Toast } from "@/components/toast";
import { ImageUploadInput } from "@/components/inputs/ImageUploadInput";
import { TextInput } from "@/components/inputs/TextInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import TextEditor from "@/components/editor/TextEditor";
import { apiClient } from "@/lib/axios";

// Validation Schema
const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().optional(),
  coverImage: z.any().optional(), // Handled separately
  status: z.enum(["draft", "published"]).default("draft"),
  categoryIds: z.array(z.string()).optional(),
  tags: z.string().optional(), // Comma separated string for input
});

type ArticleFormValues = z.infer<typeof articleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ["article-categories"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: { id: string; name: string }[] }>(
        "/student/articles/categories",
      );
      return res.data;
    },
  });

  const categories = categoriesData?.data || [];
  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  // Form
  const methods = useForm<ArticleFormValues>({
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      status: "draft",
      categoryIds: [],
      tags: "",
    },
  });

  const {
    control,
    formState: { errors },
  } = methods;

  // Mutation
  const mutation = useMutation({
    mutationFn: async (values: ArticleFormValues) => {
      let coverImageUrl = "";

      // Handle Image Upload if present
      if (values.coverImage instanceof File) {
        coverImageUrl = await uploadFileToFirebase(
          values.coverImage,
          "articles",
        );
      } else if (typeof values.coverImage === "string") {
        coverImageUrl = values.coverImage;
      }

      // Parse tags
      const tagsArray = values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [];

      const payload = {
        ...values,
        coverImage: coverImageUrl,
        tags: tagsArray, // Key difference: sending array
      };

      const { data } = await apiClient.post("/student/articles", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-articles"] });
      Toast({
        title: "Success",
        description: "Article created successfully",
        color: "success",
      });
      router.push("/my-articles");
    },
    onError: (error: Error) => {
      Toast({
        title: "Error",
        description: error.message || "Failed to create article",
        color: "danger",
      });
    },
  });

  const onSubmit = (data: ArticleFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-full mx-auto space-y-6 pb-20">
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
          Create New Article
        </Heading>
        <Text color="muted">
          Share your thoughts and knowledge with the community.
        </Text>
      </div>

      <Card className="p-6">
        <CardBody>
          <CreateOrEditFormWrapper methods={methods} onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <ImageUploadInput
                  name="coverImage"
                  label="Upload Cover Image"
                />
              </div>

              {/* Title */}
              <TextInput
                label="Article Title"
                name="title"
                placeholder="Enter article title"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categories */}
                <SelectInput
                  label="Categories"
                  name="categoryIds"
                  placeholder="Select categories"
                  selectionMode="multiple"
                  options={categoryOptions}
                />

                {/* Tags */}
                <TextInput
                  label="Tags"
                  name="tags"
                  placeholder="Tag 1, Tag 2, Tag 3"
                  description="Separate tags with commas"
                  required={false}
                />
              </div>

              {/* Excerpt */}
              <TextareaInput
                label="Excerpt (Optional)"
                name="excerpt"
                placeholder="A short summary of your article"
                minRows={2}
                required={false}
              />

              {/* Content - Rich Text Editor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your article content here..."
                    />
                  )}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Status */}
              <SelectInput
                label="Status"
                name="status"
                placeholder="Select status"
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                ]}
              />
            </div>
          </CreateOrEditFormWrapper>
        </CardBody>
      </Card>
    </div>
  );
}
