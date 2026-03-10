import { ListGrid } from "@/components/table";
import { columnsTeacherClasses } from "@/features/lms/teacher-classes/columns";

export default function TeacherClassesPage() {
  return (
    <ListGrid
      // Field mapping
      keyField="id"
      idField="id"
      nameField="teacherName"
      // Header
      title="Teacher Allocations Classes"
      description="Manage teacher allocations to classes"
      // Resource configuration for auto-fetching and CRUD
      resourcePath="/teacher-classes"
      // Auto-generated actions
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      enableExport={true}
      enableImport={true}
      // Search & Table
      searchPlaceholder="Search by teacher or class..."
      columns={columnsTeacherClasses}
      pageSize={10}
      showPagination
      serverSide={true}
      paginationType="page"
    />
  );
}
