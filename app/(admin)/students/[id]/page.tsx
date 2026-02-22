"use client";

import { use } from "react";
import { useStudentDetail } from "@/services/studentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { StudentStatusChip } from "@/components/student-status-chip";
import { StatusChip } from "@/components/status-chip";

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

  const s = data.data;
  const fullName = [s.firstName, s.middleName, s.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="max-w-4xl mx-auto">
      <CardWrapper
        title={fullName}
        description={`Student ID: ${s.studentId} • ${s.email}`}
      >
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration */}
          <TextShow label="Student ID" value={s.studentId} />
          <TextShow
            label="Registration Date"
            value={s.registrationDate}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />

          {/* Personal Info */}
          <TextShow label="Full Name" value={fullName} />
          <TextShow
            label="Gender"
            value={s.gender ? (s.gender === "male" ? "Male" : "Female") : "-"}
          />
          <TextShow label="Place of Birth" value={s.placeOfBirth || "-"} />
          <TextShow
            label="Date of Birth"
            value={s.dateOfBirth}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP") : "-"
            }
          />

          {/* Contact */}
          <TextShow label="Email" value={s.email} />
          <TextShow label="Phone" value={s.phone || "-"} />
          <div className="md:col-span-2">
            <TextShow label="Address" value={s.address || "-"} />
          </div>

          {/* Education & Occupation */}
          <TextShow label="Education" value={s.education || "-"} />
          <TextShow label="Occupation" value={s.occupation || "-"} />

          {/* Timestamps */}
          <TextShow
            label="Joined At"
            value={s.createdAt}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP p") : "-"
            }
          />
          <TextShow
            label="Last Updated"
            value={s.updatedAt}
            renderValue={(val) =>
              val ? format(new Date(val as string), "PPP p") : "-"
            }
          />
          <div className="flex flex-col gap-1">
            <StatusChip
              status="active"
              defaultLabel="Status"
              options={{
                active: { color: "success", label: "Active" },
                inactive: { color: "danger", label: "Inactive" },
                on_leave: { color: "warning", label: "On Leave" },
              }}
            />
          </div>
        </dl>
      </CardWrapper>
    </div>
  );
}
