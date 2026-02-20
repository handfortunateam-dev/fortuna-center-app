import { Columns } from "@/components/table";
import { IStudent } from "./interface";

export const columns: Columns<IStudent> = [
  {
    key: "firstName",
    label: "Full Name",
    value: (item) =>
      [item.firstName, item.middleName, item.lastName]
        .filter(Boolean)
        .join(" "),
  },
  {
    key: "email",
    label: "Email",
    value: (item) => item.email || "-",
  },
  {
    key: "phone",
    label: "Phone",
    value: (item) => item.phone || "-",
  },
  {
    key: "address",
    label: "Address",
    value: (item) => item.address || "-",
  },
];
