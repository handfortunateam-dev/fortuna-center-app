import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrations",
};

export default function RegistrationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
