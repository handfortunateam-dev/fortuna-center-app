import type { Metadata } from "next";
import HeroSection from "@/features/public/landing-page/HeroSection";
import AboutSection from "@/features/public/landing-page/AboutSection";
import ProgramsSection from "@/features/public/landing-page/ProgramsSection";
import GallerySection from "@/features/public/landing-page/GallerySection";
import LocationSection from "@/features/public/landing-page/LocationSection";
import ScrollToTopButton from "@/components/scroll-to-top";

export const metadata: Metadata = {
  title: "Fortuna Center Kupang | English Course & HRD Training",
  description:
    "Fortuna English & HRD Training Centre — a leading institution in Kupang, NTT dedicated to English mastery, broadcast training, and professional development. Unlock your potential with us.",
  alternates: {
    canonical: "https://www.fortunacenter.com",
  },
  openGraph: {
    title: "Fortuna Center Kupang | English Course & HRD Training",
    description:
      "A leading English course and HRD training center in Kupang, East Nusa Tenggara. Join us and unlock your potential.",
    url: "https://www.fortunacenter.com",
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <GallerySection />
      <LocationSection />
      <ScrollToTopButton />
    </main>
  );
}
