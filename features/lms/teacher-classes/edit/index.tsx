import React from "react";
import { TeacherClassForm } from "../forms/TeacherClassForm";

interface TeacherClassEditProps {
  assignmentId: string;
}

export default function TeacherClassEdit({
  assignmentId,
}: TeacherClassEditProps) {
  return <TeacherClassForm mode="edit" assignmentId={assignmentId} />;
}
