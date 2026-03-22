import { Columns } from "@/components/table";
import { IStudent } from "./interface";

export const getStudentColumns = (
  onPromote?: (student: IStudent) => void,
): Columns<IStudent> => [
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
  // {
  //   key: "currentLevel",
  //   label: "Level",
  //   value: (item) => (
  //     <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
  //       {item.currentLevel || ""}
  //     </span>
  //   ),
  // },
  {
    key: "registrationDate",
    label: "Joined",
    value: (item) =>
      item.registrationDate
        ? new Date(item.registrationDate).toLocaleDateString()
        : "-",
  },
  {
    key: "isEnrolled",
    label: "Enrollment",
    align: "center",
    value: (item) => (
      <div className="flex flex-col gap-1 items-center">
        {item.isEnrolled ? (
          <>
            <span className="text-xs font-bold text-success capitalize bg-success/10 px-2 py-0.5 rounded-full">
              Enrolled
            </span>
            <span className="text-[10px] text-default-500 font-medium whitespace-nowrap">
              {item.enrolledClass?.name} ({item.enrolledClass?.level})
            </span>
          </>
        ) : (
          <span className="text-xs font-bold text-default-400 capitalize bg-default-100 px-2 py-0.5 rounded-full">
            Not Enrolled
          </span>
        )}
      </div>
    ),
  },
  // {
  //   key: "actions",
  //   label: "Quick Actions",
  //   align: "center",
  //   value: (item) => (
  //     <div className="flex items-center gap-2">
  //       <Button
  //         isIconOnly
  //         size="sm"
  //         variant="flat"
  //         color="primary"
  //         onPress={() => onPromote?.(item)}
  //         title="Promote Student"
  //       >
  //         <Icon icon="solar:round-transfer-vertical-bold" className="text-lg" />
  //       </Button>
  //     </div>
  //   ),
  // },
];

export const columns: Columns<IStudent> = getStudentColumns();
