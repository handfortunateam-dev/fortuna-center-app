import { Chip } from "@heroui/react";
import { format } from "date-fns";
import { BillingItem } from "../interfaces";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export const columnsBillingHistory = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "date",
    label: "Date",
    value: (item: BillingItem) =>
      format(new Date(item.date), "MMM d, yyyy HH:mm"),
  },
  {
    key: "type",
    label: "Type",
    value: (item: BillingItem) => (
      <Chip
        size="sm"
        color={item.type === "invoice" ? "danger" : "success"}
        variant="flat"
        className="capitalize"
      >
        {item.type}
      </Chip>
    ),
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "amount",
    label: "Amount",
    value: (item: BillingItem) => formatCurrency(Math.abs(item.amount)),
  },
  {
    key: "balance",
    label: "Balance",
    value: (item: BillingItem) => formatCurrency(item.balance),
  },
];
