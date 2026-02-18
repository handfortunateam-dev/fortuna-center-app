export interface BillingItem {
  id: number;
  date: string;
  type: string;
  description: string;
  amount: number;
  balance: number;
}

export interface InvoiceItem {
  id: number;
  description: string;
  date: string;
  amount: number;
}

export interface PendingChargeItem {
  id: number;
  description: string;
  amount: number;
  unit_price: number;
  unit_quantity: number;
  date?: string;
}
