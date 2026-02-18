import { PendingChargeItem } from "../interfaces";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export const columnsPendingCharges = [
  {
    key: "description",
    label: "Description",
  },
  {
    key: "unit_price",
    label: "Unit Price",
    value: (item: PendingChargeItem) => formatCurrency(item.unit_price),
  },
  {
    key: "unit_quantity",
    label: "Quantity",
  },
  {
    key: "amount",
    label: "Amount",
    value: (item: PendingChargeItem) => formatCurrency(item.amount),
  },
];
