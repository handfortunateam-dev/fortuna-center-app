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
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "address",
    label: "Address",
  },
];
