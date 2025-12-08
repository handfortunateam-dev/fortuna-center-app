import ClassEnroll from "@/features/classes/enroll";
import React from "react";

export default function EnrollPage({ params }: { params: { id: string } }) {
  return <ClassEnroll classId={params.id} />;
}
