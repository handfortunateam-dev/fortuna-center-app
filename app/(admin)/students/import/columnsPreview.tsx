import { FormTableColumn } from "@/components/table/FormTable";
import {
  EDUCATION_LEVELS,
  OCCUPATION_TYPES,
} from "@/features/lms/students/constants";

// Kolom preview — eksplisit & aman, tidak bergantung nama kolom di Excel
export const previewColumns: FormTableColumn[] = [
  {
    key: "registrationDate",
    label: "Registration Date",
    type: "date",
    minWidth: 200,
  },
  {
    key: "firstName",
    label: "First Name",
    type: "text",
    required: true,
    minWidth: 160,
  },
  {
    key: "middleName",
    label: "Middle Name",
    type: "text",
    required: false,
    minWidth: 150,
  },
  {
    key: "lastName",
    label: "Last Name",
    type: "text",
    required: true,
    minWidth: 160,
  },
  {
    key: "nickname",
    label: "Nickname",
    type: "text",
    minWidth: 160,
  },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    minWidth: 140,
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  {
    key: "placeOfBirth",
    label: "Place of Birth",
    type: "text",
    minWidth: 180,
  },
  { key: "dateOfBirth", label: "Date of Birth", type: "date", minWidth: 200 },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: false,
    minWidth: 220,
  },
  {
    key: "phone",
    label: "Phone",
    type: "text",
    required: true,
    minWidth: 160,
  },
  { key: "address", label: "Address", type: "text", minWidth: 260 },
  {
    key: "education",
    label: "Education",
    type: "select",
    minWidth: 200,
    options: EDUCATION_LEVELS,
  },
  {
    key: "occupation",
    label: "Occupation",
    type: "select",
    minWidth: 200,
    options: OCCUPATION_TYPES,
  },
];
