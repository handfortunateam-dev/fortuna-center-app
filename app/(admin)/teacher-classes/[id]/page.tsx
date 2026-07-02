"use client";

import { use } from "react";
import { useTeacherClassDetail } from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { formatDateLong } from "@/lib/utils";

interface TeacherClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TeacherClassDetailPage({
  params,
}: TeacherClassDetailPageProps) {
  const resolvedParams = use(params);
  const { data, isLoading } = useTeacherClassDetail(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="detail" />
      </div>
    );
  }

  if (!data?.data) {
    return <StateMessage message="Teacher Assignment Not Found" />;
  }

  const assignment = data.data;

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Teacher Class Assignment"
        description={`${assignment.teacherName} assigned to ${assignment.className}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextShow
            label="Teacher"
            value={assignment.teacherName || assignment.teacherId}
          />

          <TextShow
            label="Class"
            value={assignment.className || assignment.classId}
          />

          <TextShow
            label="Assigned Date"
            value={assignment.assignedAt}
            renderValue={(val) =>
              formatDateLong(val as string | Date | null | undefined)
            }
          />

          <TextShow
            label="Assigned By"
            value={assignment.assignedByName || assignment.assignedBy}
          />
        </dl>
      </CardWrapper>
    </div>
  );
}
