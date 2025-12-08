import React from "react";
import ClassEnrollmentEdit from "@/features/classes/enrollments/edit";

interface ClassEnrollmentEditPageProps {
  params: { id: string };
}

export default function ClassEnrollmentEditPage({
  params,
}: ClassEnrollmentEditPageProps) {
  return <ClassEnrollmentEdit enrollmentId={params.id} />;
}
