"use client";

import { use } from "react";
import { useClassDetail } from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { Chip } from "@heroui/react";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const resolvedParams = use(params);
  const { data, isLoading } = useClassDetail(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="detail" />
      </div>
    );
  }

  if (!data?.data) {
    return <StateMessage message="Class Not Found" />;
  }

  const classData = data.data;

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title={classData.name}
        description={`Class Code: ${classData.code}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextShow label="Class Name" value={classData.name} />

          <TextShow label="Class Code" value={classData.code} />

          <TextShow
            label="Status"
            value={classData.isActive}
            renderValue={(val) => (
              <Chip color={val ? "success" : "default"} size="sm">
                {val ? "Active" : "Inactive"}
              </Chip>
            )}
          />

          <TextShow
            label="Created At"
            value={classData.createdAt}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />

          <div className="md:col-span-2">
            <TextShow
              label="Description"
              value={classData.description || "No description provided"}
            />
          </div>

          <TextShow
            label="Created By"
            value={classData.createdByName || classData.createdBy}
          />

          {classData.updatedAt && (
            <TextShow
              label="Last Updated"
              value={classData.updatedAt}
              renderValue={(val) =>
                val ? format(new Date(val as string), "PPP") : "-"
              }
            />
          )}
        </dl>
      </CardWrapper>
    </div>
  );
}
