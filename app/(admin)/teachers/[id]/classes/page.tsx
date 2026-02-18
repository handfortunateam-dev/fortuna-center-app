import { ListGrid } from "@/components/table";
import { columnsTeacherClasses } from "@/features/lms/teacher-classes/columns";

export default async function TeacherClassesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ListGrid
      // Field mapping
      keyField="id"
      idField="id"
      nameField="teacherName"
      // Header
      title="Teacher Class Assignments"
      description="View assignments for this teacher"
      // Resource configuration for auto-fetching
      resourcePath={`/teacher-classes?teacherId=${id}`}
      // Actions
      enableCreate={false}
      enableShow={true}
      enableEdit={false}
      enableDelete={false}
      // Search & Table
      searchPlaceholder="Search by class..."
      columns={columnsTeacherClasses}
      pageSize={10}
      showPagination
    />
  );
}
