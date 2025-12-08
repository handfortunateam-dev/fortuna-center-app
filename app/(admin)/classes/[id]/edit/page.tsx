import React from "react";
import ClassEdit from "@/features/classes/edit";

interface ClassEditPageProps {
  params: { id: string };
}

export default function ClassEditPage({ params }: ClassEditPageProps) {
  return <ClassEdit classId={params.id} />;
}
