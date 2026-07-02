import { getAuthUser } from "@/lib/auth/getAuthUser";
import { AdminSupport } from "@/features/help-supports/components/AdminSupport";
import { EndUserSupport } from "@/features/help-supports/components/EndUserSupport";
import { redirect } from "next/navigation";
import { UserRole } from "@/enums/common";

export default async function HelpSupportPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isDev = user.role === UserRole.DEVELOPER;

  if (isDev) {
    return <AdminSupport />;
  }

  return <EndUserSupport />;
}
