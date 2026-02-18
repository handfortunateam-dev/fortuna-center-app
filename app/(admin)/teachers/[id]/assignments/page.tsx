import { ListGrid } from "@/components/table";
import { columns } from "@/features/lms/assignments-by-teacher/columns";

export default async function TeacherAssignmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ListGrid
      title="Teacher Assignments"
      description="View assignments created by this teacher"
      columns={columns}
      resourcePath={`/assignments-by-teacher?teacherId=${id}`}
      searchPlaceholder="Search by title..."
      enableEdit={false}
      enableShow={true}
    />
  );
}
