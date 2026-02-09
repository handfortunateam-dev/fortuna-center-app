import ClassDetails from "@/features/teacher/classes/ClassDetails";
import React from "react";

export default async function ClassDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClassDetails classId={id} />;
}
