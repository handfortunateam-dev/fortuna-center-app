import React from "react";
import { ClassEnrollmentForm } from "../forms/ClassEnrollmentForm";

interface ClassEnrollmentEditProps {
  enrollmentId: string;
}

export default function ClassEnrollmentEdit({
  enrollmentId,
}: ClassEnrollmentEditProps) {
  return <ClassEnrollmentForm mode="edit" enrollmentId={enrollmentId} />;
}
