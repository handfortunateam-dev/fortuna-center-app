"use client";

import { useUsers } from "@/services/usersService";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ClerkUser } from "@/features/users/interfaces";
import { ListGrid } from "@/components/ui/ListGrid";
// import { EyeIcon, UserIcon } from "lucide-react";
import { Avatar, Chip } from "@heroui/react";
import { ACTION_BUTTONS, ADD_BUTTON } from "@/components/ui/Button/ActionButtons";

export default function UserList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: dataUsers,
    isLoading,
    isError,
    error,
  } = useUsers({
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    query: searchQuery || undefined,
  });

  // const users = data?.data || [];
  const totalCount = dataUsers?.totalCount || 0;

  const columns = [
    {
      key: "avatar",
      label: "Avatar",
      value: (user: ClerkUser) => (
        <Avatar
          src={user.imageUrl}
          name={user.fullName || user.email || "User"}
          size="sm"
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      value: (user: ClerkUser) => (
        <div>
          <div className="font-semibold">{user.fullName || "N/A"}</div>
          <div className="text-xs text-gray-500">@{user.username || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      value: (user: ClerkUser) => (
        <div className="flex items-center gap-2">
          {user.email || "N/A"}
          {user.emailVerified && (
            <Chip size="sm" color="success" variant="flat">
              Verified
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      value: (user: ClerkUser) =>
        new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "lastSignIn",
      label: "Last Sign In",
      value: (user: ClerkUser) =>
        user.lastSignInAt
          ? new Date(user.lastSignInAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Never",
    },
    {
      key: "actions",
      label: "Actions",
      align: "center" as const,
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <ListGrid
      keyField="id"
      idField="id"
      title={"User Management"}
      description={"Manage users from Clerk authentication"}
      actionButtons={{
        add: ADD_BUTTON.CREATE("/users/create"),
        show: ACTION_BUTTONS.SHOW((id) => router.push(`/users/${id}`)),
      }}
      isError={isError}
      error={error}
      loading={isLoading}
      empty={dataUsers?.data?.length === 0}
      nameField="fullName"
      searchPlaceholder="Search users by name, email, or username..."
      data={dataUsers}
      onSearch={handleSearch}
      columns={columns as never}
      pageSize={pageSize}
      showPagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}