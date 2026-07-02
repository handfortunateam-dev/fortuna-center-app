import ClassEnroll from "@/features/lms/classes/enroll";
import React, { use } from "react";

export default function EnrollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ClassEnroll classId={id} />;
}
