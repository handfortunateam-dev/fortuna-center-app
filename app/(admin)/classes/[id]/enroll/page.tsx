import ClassEnroll from "@/features/lms/classes/enroll";
import React from "react";

export default function EnrollPage({ params }: { params: { id: string } }) {
  return <ClassEnroll classId={params.id} />;
}
