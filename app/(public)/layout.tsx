/**
 * Public Layout
 * Layout for public pages (homepage, blog posts, etc.) with Navbar and Footer
 */

import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { ReactNode } from "react";
// import Navbar from "@/components/layout/navbar";
// import { Footer } from "@/components/layout/footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
