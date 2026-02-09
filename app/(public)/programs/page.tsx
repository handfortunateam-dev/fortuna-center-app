import { redirect } from "next/navigation";

export default function ProgramsRootPage() {
  // Redirect /programs to the first child /programs/broadcast
  redirect("/programs/broadcast");
}
