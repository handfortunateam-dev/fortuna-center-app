"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, Button, Spinner, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { apiClient } from "@/lib/axios";
import { format } from "date-fns";

type TagDetail = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export default function TagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icon
          icon="solar:sad-circle-outline"
          className="text-4xl text-gray-400 mb-2"
        />
        <Text>Tag not found</Text>
        <Button
          variant="light"
          color="primary"
          onPress={() => router.push("/blog-cms/tags")}
        >
          Back to List
        </Button>
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
        <div className="flex-1" />
        <Button
          color="primary"
          startContent={<Icon icon="solar:pen-new-square-linear" />}
          onPress={() => router.push(`/blog-cms/tags/${id}/edit`)}
        >
          Edit
        </Button>
      </div>

      <div className="space-y-2">
        <Heading size="3xl" weight="bold">
          {tag.name}
        </Heading>
        <Text color="muted">Tag Details</Text>
      </div>

      <Card className="p-6">
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </Text>
              <Text className="mt-1 text-lg">{tag.name}</Text>
            </div>

            <div>
              <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Slug
              </Text>
              <Text className="mt-1 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block text-sm">
                {tag.slug}
              </Text>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
            <div>
              <span className="font-semibold">Created:</span>{" "}
              {format(new Date(tag.createdAt), "PPP")}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
