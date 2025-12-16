import HeroSection from "@/features/public/landing-page/HeroSection";
import AboutSection from "@/features/public/landing-page/AboutSection";
import ProgramsSection from "@/features/public/landing-page/ProgramsSection";
import GallerySection from "@/features/public/landing-page/GallerySection";
import LocationSection from "@/features/public/landing-page/LocationSection";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Fortuna Center Kupang. We provide top-notch English courses and HRD training to boost your professional career.",
  alternates: {
    canonical: "https://www.fortunacenter.com",
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
