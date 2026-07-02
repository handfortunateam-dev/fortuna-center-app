"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Image,
  Chip,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { apiClient } from "@/lib/axios";
import { format } from "date-fns";
import { ApiResponse } from "@/interfaces/api";

// Types
interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  status: "draft" | "published" | "archived";
  createdAt: string;
  viewCount: number;
  likeCount: number;
}

// Fetcher
const fetchStudentArticles = async () => {
  const { data } =
    await apiClient.get<ApiResponse<Article[]>>("/student/articles");
  return data.data;
};

export default function MyArticlesPage() {
  const router = useRouter();
  const { data: articles, isLoading } = useQuery({
    queryKey: ["student-articles"],
    queryFn: fetchStudentArticles,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner size="lg" label="Loading articles..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Heading size="3xl" weight="bold" gradient>
            My Articles
          </Heading>
          <Text color="muted" size="lg">
            Manage your blog posts and share your knowledge.
          </Text>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="solar:pen-new-square-bold-duotone" />}
          onPress={() => router.push("/my-articles/create")}
          className="font-medium shadow-md shadow-blue-500/30"
        >
          Write Article
        </Button>
      </div>

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="group hover:shadow-xl transition-all duration-300 border border-gray-100"
              isPressable
              onPress={() => router.push(`/my-articles/edit/${article.id}`)}
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    classNames={{
                      wrapper: "w-full h-full",
                      img: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500",
                    }}
                    radius="none"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                    <Icon
                      icon="solar:gallery-wide-bold-duotone"
                      className="text-5xl"
                    />
                  </div>
                )}
                <div className="absolute top-3 right-3 z-10">
                  <Chip
                    size="sm"
                    color={
                      article.status === "published" ? "success" : "default"
                    }
                    variant="solid"
                    className="capitalize font-medium shadow-sm"
                  >
                    {article.status}
                  </Chip>
                </div>
              </div>
              <CardBody className="p-5 space-y-3">
                <Heading
                  as="h3"
                  size="lg"
                  className="line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors"
                >
                  {article.title}
                </Heading>
                <Text color="muted" size="sm" className="line-clamp-3">
                  {article.excerpt || "No description available."}
                </Text>
              </CardBody>
              <CardFooter className="px-5 pb-5 pt-0 flex justify-between items-center gap-2">
                <div className="flex items-center gap-4 text-gray-400 text-xs">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:eye-bold" /> {article.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:heart-bold" /> {article.likeCount}
                  </span>
                  <span className="ml-2">
                    {format(new Date(article.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color="primary"
                    aria-label="Edit"
                    onPress={() =>
                      router.push(`/my-articles/edit/${article.id}`)
                    }
                  >
                    <Icon icon="solar:pen-bold" className="text-lg" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color="secondary"
                    aria-label="Preview"
                    // Link to public blog view. Adjust if needed
                    onPress={() => window.open(`/blog/${article.id}`, "_blank")}
                  >
                    <Icon icon="solar:eye-bold" className="text-lg" />
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    color="danger"
                    aria-label="Delete"
                    onPress={async () => {
                      if (
                        confirm("Are you sure you want to delete this article?")
                      ) {
                        try {
                          await apiClient.delete(
                            `/blog-cms/posts/${article.id}`,
                          );
                          window.location.reload();
                        } catch {
                          alert("Failed to delete article");
                        }
                      }
                    }}
                  >
                    <Icon
                      icon="solar:trash-bin-trash-bold"
                      className="text-lg"
                    />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="solar:notebook-bold-duotone" className="text-4xl" />
          </div>
          <Heading size="xl" weight="bold" className="text-gray-800 mb-2">
            No Articles Yet
          </Heading>
          <Text color="muted" className="max-w-md mx-auto mb-6">
            You haven't published any articles yet. Start writing and share your
            ideas with your classmates!
          </Text>
          <Button
            color="primary"
            variant="flat"
            onPress={() => router.push("/my-articles/create")}
          >
            Create Your First Article
          </Button>
        </div>
      )}
    </div>
  );
}
