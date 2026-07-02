"use client";

import { use } from "react";
import { useClassEnrollmentDetail } from "@/services/classesService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { formatDateLong } from "@/lib/utils";

interface ClassEnrollmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassEnrollmentDetailPage({
  params,
}: ClassEnrollmentDetailPageProps) {
  const resolvedParams = use(params);
  const { data, isLoading } = useClassEnrollmentDetail(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="detail" />
      </div>
    );
  }

  if (!data?.data) {
    return <StateMessage message="Enrollment Not Found" />;
  }

  const enrollment = data.data;

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title="Class Enrollment Detail"
        description={`${enrollment.studentName} enrolled in ${enrollment.className}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextShow
            label="Student"
            value={enrollment.studentName || enrollment.studentId}
          />

          <TextShow
            label="Class"
            value={enrollment.className || enrollment.classId}
          />

          <TextShow
            label="Enrolled Date"
            value={enrollment.enrolledAt}
            renderValue={(val) =>
              formatDateLong(val as string | Date | null | undefined)
            }
          />

          <TextShow
            label="Enrolled By"
            value={enrollment.enrolledByName || enrollment.enrolledBy}
          />
        </dl>
      </CardWrapper>
    </div>
  );
}
