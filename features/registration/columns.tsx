"use client";

import { Columns } from "@/components/table";
import { Chip } from "@heroui/react";
import { RegistrationLink, Registration } from "./interfaces";

// ─── Registration Links Columns ────────────────────────────────────────────────

export const registrationLinkColumns: Columns<RegistrationLink> = [
  {
    key: "label",
    label: "Label",
  },
  {
    key: "slug",
    label: "Slug",
    value: (item) => (
      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
        {item.slug}
      </code>
    ),
  },
  {
    key: "description",
    label: "Description",
    value: (item) => item.description || "-",
  },
  {
    key: "isActive",
    label: "Status",
    align: "center",
    value: (item) => (
      <Chip
        size="sm"
        color={item.isActive ? "success" : "default"}
        variant="flat"
      >
        {item.isActive ? "Active" : "Inactive"}
      </Chip>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    value: (item) =>
      item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
];

// ─── Registrations Columns ─────────────────────────────────────────────────────

const statusColorMap: Record<
  Registration["status"],
  "warning" | "primary" | "success" | "danger"
> = {
  pending: "warning",
  reviewed: "primary",
  accepted: "success",
  rejected: "danger",
};

export const registrationColumns: Columns<Registration> = [
  {
    key: "firstName",
    label: "Full Name",
    value: (item) => [item.firstName, item.lastName].filter(Boolean).join(" "),
  },
  {
    key: "phone",
    label: "Phone",
    value: (item) => item.phone || "-",
  },
  {
    key: "email",
    label: "Email",
    value: (item) => item.email || "-",
  },
  {
    key: "occupation",
    label: "Occupation",
    value: (item) => item.occupation || "-",
  },
  {
    key: "linkSlug",
    label: "Link",
    value: (item) => (
      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
        {item.linkSlug}
      </code>
    ),
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    value: (item) => (
      <Chip
        size="sm"
        color={statusColorMap[item.status]}
        variant="flat"
        className="capitalize"
      >
        {item.status}
      </Chip>
    ),
  },
  {
    key: "createdAt",
    label: "Submitted",
    value: (item) =>
      item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
  },
];
