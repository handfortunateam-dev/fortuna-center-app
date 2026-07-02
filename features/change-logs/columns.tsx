import { BooleanChip } from "@/components/boolean-chip";
import { Columns } from "@/components/table";
import { Changelog } from "./interfaces";
import { formatDate } from "@/lib/utils";
import { Chip } from "@heroui/react";

export const columnsChangeLogs: Columns<Changelog> = [
  {
    key: "version",
    label: "Version",
    value: (item) => item.version,
  },

  {
    key: "type",
    label: "Type",
    value: (item) => {
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            item.type === "FEATURE"
              ? "secondary"
              : item.type === "BUG_FIX"
                ? "danger"
                : item.type === "IMPROVEMENT"
                  ? "primary"
                  : "warning"
          }
        >
          {item.type.replace("_", " ")}
        </Chip>
      );
    },
  },
  {
    key: "title",
    label: "Title",
    value: (item) => item.title,
  },

  {
    key: "isPublished",
    label: "Status",
    value: (item) => (
      <BooleanChip
        value={item.isPublished}
        trueText="Published"
        falseText="Draft"
      />
    ),
  },

  {
    key: "createdAt",
    label: "Created At",
    value: (item) => formatDate(item.createdAt),
  },
];
