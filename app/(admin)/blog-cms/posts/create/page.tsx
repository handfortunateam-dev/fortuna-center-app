"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import BlogForm from "@/features/blog/BlogForm";
import {
  BlogCategory,
  BlogAuthor,
  BlogTag,
  CreateBlogPostData,
} from "@/features/blog/interfaces";
import { NAV_URL } from "@/constants/url";
import {
  useBlogCategories,
  useBlogTags,
  useCreateBlogPost,
} from "@/services/blogService";
import { useUsers } from "@/services/usersService";
import { Toast } from "@/components/toast";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useBlogCategories();
  const { data: tags = [] } = useBlogTags();
  const { data: authorsData } = useUsers({ source: "db" });
  const authors: BlogAuthor[] = (authorsData?.data || []).map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email || "",
    imageUrl: user.imageUrl,
  }));

  const createPostMutation = useCreateBlogPost();

  const handleSubmit = async (data: CreateBlogPostData) => {
    try {
      await createPostMutation.mutateAsync(data);
      
      // Invalidate queries to refetch data on posts page
      await queryClient.invalidateQueries({ queryKey: ["/blog-cms/posts"] });
      
      Toast({
        title: "Success",
        description: "Blog post created successfully",
        color: "success",
      });
      router.push(NAV_URL.ADMIN.BLOG_CMS.POSTS);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create post";
      Toast({
        title: "Error",
        description: errorMessage,
        color: "danger",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Heading className="text-3xl font-bold text-default-900">
          Create New Post
        </Heading>
        <Text className="text-default-500 mt-1">
          Write a new article for the blog
        </Text>
      </div>

      <BlogForm
        categories={categories}
        tags={tags}
        authors={authors}
        onSubmit={handleSubmit}
        isLoading={createPostMutation.isPending}
      />
    </div>
  );
}
