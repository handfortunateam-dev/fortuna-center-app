import { redirect } from "next/navigation";
import { NAV_URL } from "@/constants/url";

export default function VultrBillingPage() {
  redirect(NAV_URL.ADMIN.VULTR.HISTORY);
}
