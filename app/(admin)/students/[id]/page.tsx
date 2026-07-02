"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useStudentDetail } from "@/services/studentsService";
import CardWrapper from "@/components/wrappers/card-wrappers";
import TextShow from "@/components/text-show";
import { format } from "date-fns";
import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { StateMessage } from "@/components/state-message";
import { StudentStatusChip } from "@/components/student-status-chip";
import { StatusChip } from "@/components/status-chip";
import { useClassEnrollments } from "@/services/classesService";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data, isLoading } = useStudentDetail(resolvedParams.id);
  const { data: historyData, isLoading: isLoadingHistory } =
    useClassEnrollments({
      studentId: resolvedParams.id,
    });

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
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="flat"
          startContent={<Icon icon="lucide:arrow-left" className="w-4 h-4" />}
          onPress={() => router.push("/students")}
        >
          Back
        </Button>
        <Button
          color="primary"
          startContent={<Icon icon="lucide:pencil" className="w-4 h-4" />}
          onPress={() => router.push(`/students/${resolvedParams.id}/edit`)}
        >
          Edit Student
        </Button>
      </div>
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
          <div className="md:col-span-2">
            <TextShow
              label="Current Level"
              value={s.currentLevel || ""}
            />
          </div>

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

      {/* Enrollment History */}
      <CardWrapper
        title="Enrollment History"
        description="History of classes and promotions for this student"
      >
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center p-8">
              <Icon
                icon="solar:round-transfer-vertical-bold"
                className="animate-spin text-4xl text-primary"
              />
            </div>
          ) : historyData?.data && historyData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="pb-3 font-semibold">Class Name</th>
                    <th className="pb-3 font-semibold">Enrolled At</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100">
                  {historyData.data.map((h) => (
                    <tr key={h.id} className="group">
                      <td className="py-3">
                        <p className="font-medium text-default-900">
                          {h.className}
                        </p>
                      </td>
                      <td className="py-3 text-default-500">
                        {h.enrolledAt
                          ? format(new Date(h.enrolledAt), "PPP")
                          : "-"}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            h.status === "active"
                              ? "bg-success/10 text-success"
                              : h.status === "completed"
                                ? "bg-primary/10 text-primary"
                                : "bg-default-100 text-default-500"
                          }`}
                        >
                          {h.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-default-50 rounded-xl border border-dashed border-default-300">
              <Icon
                icon="lucide:history"
                className="mx-auto text-4xl text-default-300 mb-2"
              />
              <p className="text-default-400">No enrollment history found</p>
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  );
}
