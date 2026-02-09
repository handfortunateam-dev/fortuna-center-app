"use client";

import HeroSection from "@/features/public/landing-page/HeroSection";
import AboutSection from "@/features/public/landing-page/AboutSection";
import ProgramsSection from "@/features/public/landing-page/ProgramsSection";
import GallerySection from "@/features/public/landing-page/GallerySection";
import LocationSection from "@/features/public/landing-page/LocationSection";
import ScrollToTopButton from "@/components/scroll-to-top";

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
