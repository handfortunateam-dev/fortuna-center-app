import { Avatar, Chip } from "@heroui/react";
import { ClerkUser } from "../interfaces";

export const columnsUsers = [
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
    key: "role",
    label: "Role",
    value: (user: ClerkUser) => (
      <div>
        {user.role ? (
          <Chip
            size="sm"
            color={
              user.role === "ADMIN"
                ? "danger"
                : user.role === "TEACHER"
                  ? "primary"
                  : user.role === "ADMINISTRATIVE_EMPLOYEE"
                    ? "warning"
                    : "default"
            }
            variant="flat"
          >
            {user.role}
          </Chip>
        ) : (
          <span className="text-gray-400">-</span>
        )}
        {user.isAdminEmployeeAlso && user.role === "TEACHER" && (
          <Chip size="sm" color="warning" variant="dot" className="mt-1 block">
            + Admin
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
