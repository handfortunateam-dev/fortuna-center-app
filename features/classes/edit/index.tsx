import React from "react";
import { ClassForm } from "../forms/ClassForm";

interface ClassEditProps {
  classId: string;
}

export default function ClassEdit({ classId }: ClassEditProps) {
  return <ClassForm mode="edit" classId={classId} />;
}
