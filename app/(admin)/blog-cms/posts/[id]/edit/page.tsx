"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import BlogForm from "@/features/blog/BlogForm";
import {
  BlogCategory,
  BlogAuthor,
  BlogPost,
  BlogTag,
} from "@/features/blog/interfaces";
import { NAV_URL } from "@/constants/url";
import { Spinner } from "@heroui/react";

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = React.use(params);

  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Parallel fetching
        const [postRes, catsRes, tagsRes, authorsRes] = await Promise.all([
          fetch(`/api/blog-cms/posts/${id}`),
          fetch("/api/blog-cms/categories"),
          fetch("/api/blog-cms/tags"),
          fetch("/api/users?source=db"),
        ]);

        const postJson = await postRes.json();
        const catsJson = await catsRes.json();
        const tagsJson = await tagsRes.json();
        const authorsJson = await authorsRes.json();

        if (postJson.success) {
          setPost(postJson.data);
        } else {
          // Handle not found or error
          alert("Post not found");
          router.push(NAV_URL.ADMIN.BLOG_CMS.POSTS);
          return;
        }

        if (catsJson.success) setCategories(catsJson.data);
        if (tagsJson.success) setTags(tagsJson.data);
        if (authorsJson.success) setAuthors(authorsJson.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/blog-cms/posts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Invalidate queries to refetch data on posts page
        await queryClient.invalidateQueries({ queryKey: ["/blog-cms/posts"] });
        router.push(NAV_URL.ADMIN.BLOG_CMS.POSTS);
      } else {
        const error = await res.json();
        alert(`Failed to update post: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("An error occurred while updating the post.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Edit Post</h1>
        <p className="text-default-500 mt-1">Update blog post details</p>
      </div>

      {post && (
        <BlogForm
          initialData={post}
          categories={categories}
          tags={tags}
          authors={authors}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}
