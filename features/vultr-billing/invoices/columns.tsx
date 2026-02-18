import { format } from "date-fns";
import { InvoiceItem } from "../interfaces";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export const columnsInvoices = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "date",
    label: "Date",
    value: (item: InvoiceItem) =>
      format(new Date(item.date), "MMM d, yyyy"),
  },
  {
    key: "description",
    label: "Description",
  },
  {
    key: "amount",
    label: "Amount",
    value: (item: InvoiceItem) => formatCurrency(item.amount),
  },
];
