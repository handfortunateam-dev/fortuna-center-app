import { ListGrid } from "@/components/table";
import { columnsClasses } from "@/features/lms/classes/columns";

export default function ClassesPage() {
  return (
    <ListGrid
      // Field mapping
      keyField="id"
      idField="id"
      nameField="name"
      // Header
      title="Class Management"
      description="Manage classes and courses"
      // Resource configuration for auto-fetching and CRUD
      resourcePath="/classes"
      // Auto-generated actions (enabled by default when resourcePath is set)
      enableCreate={true}
      enableShow={true}
      enableEdit={true}
      enableDelete={true}
      // Search & Table
      searchPlaceholder="Search classes by name or code..."
      columns={columnsClasses}
      pageSize={10}
      showPagination
    />
  );
}
