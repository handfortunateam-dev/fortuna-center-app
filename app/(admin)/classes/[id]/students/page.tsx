"use client";

import { SkeletonCard } from "@/components/skeletons/SkeletonCard";
import { ListGrid } from "@/components/table";
import { getStudentColumns } from "@/features/lms/students/columns";
import { useClassDetail } from "@/services/classesService";
import { use } from "react";

interface ClassStudentsPageProps {
  params: Promise<{ id: string }>;
}

export default function ClassStudentsPage({ params }: ClassStudentsPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { data: classData, isLoading: isClassLoading } = useClassDetail(id);

  if (isClassLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
      </div>
    );
  }

  const className = classData?.data?.name || "Class";
  const classCode = classData?.data?.code || id;

  const columns = getStudentColumns();

  return (
    <ListGrid
      title={`Students in ${className}`}
      description={`List of students currently enrolled in class ${classCode}`}
      resourcePath={`/classes/${id}/students`}
      columns={columns}
      enableSearch
      enableExport
      enableColumnVisibility
      // Assuming we don't want to create student here, just view
      enableCreate={false}
      enableDelete={false}
      enableEdit={false}
      enableShow={true}
      basePath="/students" // When clicking view, go to student detail
    />
  );
}
