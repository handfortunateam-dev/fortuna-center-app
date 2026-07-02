"use client";

import { Columns } from "@/components/table";
import { ITeacher } from "./interface";
import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

export const columns: Columns<ITeacher> = [
  {
    key: "teacherNumber",
    label: "NO",
    value: (teacher) => (
      <span className="font-mono text-default-500">
        #{teacher.teacherNumber}
      </span>
    ),
  },
  {
    key: "firstName", // Di map ke fullName biasanya untuk display
    label: "FULL NAME",
    value: (teacher) => {
      const parts = [
        teacher.firstName,
        teacher.middleName,
        teacher.lastName,
      ].filter(Boolean);
      return <div className="font-medium">{parts.join(" ")}</div>;
    },
  },
  {
    key: "email",
    label: "EMAIL",
  },
  {
    key: "gender",
    label: "GENDER",
    value: (teacher) => (
      <span className="capitalize">{teacher.gender || "-"}</span>
    ),
  },
  {
    key: "phone",
    label: "PHONE",
    value: (teacher) => teacher.phone || "-",
  },
  {
    key: "education",
    label: "EDUCATION",
    value: (teacher) =>
      teacher.education ? (
        <Chip size="sm" variant="flat" color="primary">
          {teacher.education}
        </Chip>
      ) : (
        "-"
      ),
  },
  {
    key: "isLinkedAccount",
    label: "LINKED ACCOUNT",
    value: (teacher) => (
      <Chip
        size="sm"
        variant="flat"
        color={teacher.isLinkedAccount ? "success" : "warning"}
        startContent={
          <Icon
            icon={
              teacher.isLinkedAccount
                ? "solar:check-circle-bold"
                : "solar:close-circle-bold"
            }
          />
        }
      >
        {teacher.isLinkedAccount ? "Linked" : "Unlinked"}
      </Chip>
    ),
  },
];
