import { Columns } from "@/components/table";
import { IStudent } from "./interface";

export const columns: Columns<IStudent> = [
  {
    key: "studentId",
    label: "ID",
  },
  {
    key: "firstName",
    label: "Full Name",
    value: (item) =>
      [item.firstName, item.middleName, item.lastName]
        .filter(Boolean)
        .join(" "),
  },
  {
    key: "gender",
    label: "Gender",
    align: "center",
    value: (item) => <span className="capitalize">{item.gender || "-"}</span>,
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
    key: "registrationDate",
    label: "Joined",
    value: (item) =>
      item.registrationDate
        ? new Date(item.registrationDate).toLocaleDateString()
        : "-",
  },
];
