import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Fortuna Center Kupang, our vision, mission, and journey in providing English and HRD training.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fortuna Center Kupang",
    url: "https://www.fortunacenter.com",
    logo: "https://www.fortunacenter.com/logo.png", // Ensure logo exists or update
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-812-3456-7890", // Update with real number if known
      contactType: "customer service",
    },
    sameAs: [
      "https://www.facebook.com/fortunacenter",
      "https://www.instagram.com/fortunacenter",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
