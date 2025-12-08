import React from "react";
import TeacherClassEdit from "@/features/classes/teacher-classes/edit";

interface TeacherClassEditPageProps {
  params: { id: string };
}

export default function TeacherClassEditPage({
  params,
}: TeacherClassEditPageProps) {
  return <TeacherClassEdit assignmentId={params.id} />;
}
