"use client";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  BlogPost,
  BlogCategory,
  BlogAuthor,
  BlogTag,
  CreateBlogPostData,
  UpdateBlogPostData,
} from "./interfaces";
import { Icon } from "@iconify/react";
import { TextInput } from "@/components/inputs/TextInput";
import { TextEditorInput } from "@/components/inputs/TextEditorInput";
import { AutocompleteInput } from "@/components/inputs/AutoCompleteInput";
import { SelectInput } from "@/components/inputs/SelectInput";
import { DatePickerInput } from "@/components/inputs/DatePickerInput";
import { TextareaInput } from "@/components/inputs/TextareaInput";
import { Heading } from "@/components/heading";
import FileUpload from "@/components/inputs/FileUpload";
import Image from "next/image";

interface BlogFormProps {
  initialData?: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
  authors?: BlogAuthor[];
  onSubmit: (data: CreateBlogPostData | UpdateBlogPostData) => Promise<void>;
  isLoading?: boolean;
}

export default function BlogForm({
  initialData,
  categories,
  tags,
  authors = [],
  onSubmit,
  isLoading = false,
}: BlogFormProps) {
  const router = useRouter();
  const methods = useForm({
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      coverImage: initialData?.coverImage || "",
      status: initialData?.status || "draft",
      categoryIds: initialData?.categories?.map((c) => c.category.id) || [],
      tagIds: initialData?.tags?.map((t) => t.tag.id) || [],
      authorId: initialData?.author?.id || "",
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : "",
    },
  });
  const { handleSubmit, setValue } = methods;

  const coverImage = useWatch({ control: methods.control, name: "coverImage" });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-default-200 space-y-4">
              <Heading
                className="text-xl font-bold flex items-center gap-2"
                startContent={
                  <Icon icon="solar:document-bold" className="text-primary" />
                }
              >
                Post Content
              </Heading>

              <TextInput
                name="title"
                label="Title"
                placeholder="Enter post title"
                validation={{ required: "Title is required" }}
              />

              <TextEditorInput
                name="content"
                label="Content"
                required={true}
                validation={{ required: "Content is required" }}
              />

              <TextareaInput
                name="excerpt"
                label="Excerpt"
                placeholder="Brief summary of the post..."
                required={false}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-default-200 space-y-4">
              <Heading
                className="text-xl font-bold flex items-center gap-2"
                startContent={
                  <Icon icon="solar:settings-bold" className="text-primary" />
                }
              >
                Settings
              </Heading>

              {/* <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Status"
                    variant="bordered"
                    selectedKeys={[field.value]}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <SelectItem key="draft">Draft</SelectItem>
                    <SelectItem key="published">Published</SelectItem>
                    <SelectItem key="archived">Archived</SelectItem>
                  </Select>
                )}
              /> */}

              <AutocompleteInput
                name="status"
                label="Status"
                required={true}
                options={[
                  { label: "Draft", value: "draft" },
                  { label: "Published", value: "published" },
                  { label: "Archived", value: "archived" },
                ]}
                isClearable={true}
              />

              <DatePickerInput
                name="publishedAt"
                label="Publish Date"
                required={false}
              />

              <SelectInput
                name="categoryIds"
                label="Categories"
                placeholder="Select categories"
                selectionMode="multiple"
                required={false}
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />

              <SelectInput
                name="tagIds"
                label="Tags"
                placeholder="Select tags"
                selectionMode="multiple"
                required={false}
                options={tags.map((tag) => ({
                  label: tag.name,
                  value: tag.id,
                }))}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image</label>
                {coverImage && (
                  <div className="relative rounded-lg overflow-hidden border border-default-200">
                    <Image
                      src={coverImage}
                      alt="Cover preview"
                      width={400}
                      height={128}
                      className="w-full h-32"
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      className="absolute top-2 right-2"
                      onPress={() => setValue("coverImage", "")}
                    >
                      <Icon icon="lucide:x" />
                    </Button>
                  </div>
                )}
                <FileUpload
                  accept="image/*"
                  label="Upload Cover Image"
                  onUploadComplete={(url) => setValue("coverImage", url)}
                />
              </div>

              {/* Author Selection */}
              {authors.length > 0 && (
                <AutocompleteInput
                  name="authorId"
                  label="Author"
                  placeholder="Select author"
                  required={false}
                  options={authors.map((author) => ({
                    label: author.fullName,
                    value: author.id,
                  }))}
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                color="primary"
                variant="solid"
                type="submit"
                isLoading={isLoading}
                className="flex-1 font-bold"
                startContent={!isLoading && <Icon icon="solar:disk-bold" />}
              >
                Save Post
              </Button>
              <Button
                variant="flat"
                onPress={() => router.back()}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
