"use client";

import { use } from "react";
import { useTeacherDetail } from "@/services/teachersService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { Chip } from "@heroui/react";

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const resolvedParams = use(params);
  // @ts-ignore - useTeacherDetail returns { data: { data: ITeacher } } based on step 555
  const { data, isLoading } = useTeacherDetail(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SkeletonCard variant="detail" />
      </div>
    );
  }

  // Adjusted data access based on typical API response structure wrapper
  const teacher = data?.data;

  if (!teacher) {
    return (
      <StateMessage
        title="Teacher Not Found"
        message="The requested teacher could not be found."
      />
    );
  }

  const fullName = [teacher.firstName, teacher.middleName, teacher.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <CardWrapper
        title={fullName}
        description={`Teacher Number: ${teacher.teacherNumber}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <TextShow label="First Name" value={teacher.firstName} />
          <TextShow label="Middle Name" value={teacher.middleName || "-"} />
          <TextShow label="Last Name" value={teacher.lastName} />

          <TextShow
            label="Gender"
            value={teacher.gender || "-"}
            className="capitalize"
          />

          <TextShow
            label="Date of Birth"
            value={teacher.dateOfBirth}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />

          <TextShow
            label="Place of Birth"
            value={teacher.placeOfBirth || "-"}
          />

          <div className="md:col-span-2 border-t border-divider my-2"></div>

          <TextShow label="Email" value={teacher.email} />
          <TextShow label="Phone" value={teacher.phone || "-"} />

          <div className="md:col-span-2">
            <TextShow label="Address" value={teacher.address || "-"} />
          </div>

          <div className="md:col-span-2 border-t border-divider my-2"></div>

          <TextShow
            label="Education"
            value={teacher.education}
            renderValue={(val) =>
              val ? (
                <Chip size="sm" variant="flat" color="primary">
                  {val as string}
                </Chip>
              ) : (
                "-"
              )
            }
          />

          <TextShow
            label="Linked User ID"
            value={teacher.userId}
            renderValue={(val) =>
              val ? (
                <code className="bg-default-100 px-1 py-0.5 rounded text-xs">
                  {val as string}
                </code>
              ) : (
                "Not Linked"
              )
            }
          />

          <TextShow
            label="Joined At"
            value={teacher.createdAt}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />
        </dl>
      </CardWrapper>
    </div>
  );
}
