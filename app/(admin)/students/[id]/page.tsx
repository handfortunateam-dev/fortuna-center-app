"use client";

import { use } from "react";
import { useStudentDetail } from "@/services/studentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const resolvedParams = use(params);
  const { data, isLoading } = useStudentDetail(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="detail" />
      </div>
    );
  }

  if (!data?.data) {
    return <StateMessage message="Student Not Found" />;
  }

  const studentData = data.data;

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title={`${studentData.firstName} ${studentData.lastName}`}
        description={`Email: ${studentData.email}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextShow label="First Name" value={studentData.firstName} />
          <TextShow label="Last Name" value={studentData.lastName} />
          <TextShow label="Email" value={studentData.email} />
          <TextShow label="Phone" value={studentData.phone || "-"} />

          <div className="md:col-span-2">
            <TextShow label="Address" value={studentData.address || "-"} />
          </div>

          <TextShow
            label="User ID (System)"
            value={studentData.userId || "Not Linked"}
          />

          <TextShow
            label="Joined At"
            value={studentData.createdAt}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />

          {studentData.updatedAt && (
            <TextShow
              label="Last Updated"
              value={studentData.updatedAt}
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
