"use client";

import { ListGrid } from "@/components/table";
import { columnsUsers } from "./columns";

export default function UserList() {
  return (
    <ListGrid
      keyField="id"
      idField="id"
      nameField="fullName"
      title={"User Management"}
      description={"Manage users from Clerk authentication"}
      // Resource configuration for auto-fetching and CRUD
      resourcePath="/users"
      serverSide={true}
      paginationType="offset"
      // Auto-generated actions (enabled by default when resourcePath is set)
      enableCreate={true}
      enableShow={true}
      enableEdit={false} // Edit not requested in example
      enableDelete={true}
      searchPlaceholder="Search users by name, email, or username..."
      columns={columnsUsers}
      pageSize={10}
      showPagination={true}
    />
  );
}
