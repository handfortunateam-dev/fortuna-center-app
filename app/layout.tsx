import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import { ClerkProviderWrapper } from "@/lib/ClerkProviderWrapper";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { LoadingBar } from "@/components/loading/LoadingBar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fortunacenter.com"),
  title: {
    default: "Fortuna Center Kupang",
    template: "%s | Fortuna Center Kupang",
  },
  description:
    "Fortuna English & Human Resources Development (HRD) Training Centre is a distinguished institution in Kupang, NTT. We offer comprehensive English courses, broadcast training, and professional HRD programs.",
  keywords: [
    "english course kupang",
    "english training center kupang",
    "fortuna center",
    "hrd training kupang",
    "broadcast training kupang",
    "english course NTT",
    "professional development kupang",
    "fortuna english center",
  ],
  authors: [{ name: "Fortuna Center Kupang" }],
  creator: "Fortuna Center Kupang",
  publisher: "Fortuna Center Kupang",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.fortunacenter.com",
    siteName: "Fortuna Center Kupang",
    title: "Fortuna Center Kupang",
    description:
      "A leading English course and professional HRD training center in Kupang, East Nusa Tenggara.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fortuna Center Kupang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fortuna Center Kupang",
    description:
      "A leading English course and professional HRD training center in Kupang, NTT.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.fortunacenter.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
};

import { checkMaintenanceMode } from "@/lib/maintenance";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check maintenance mode on every request blockable by middleware
  await checkMaintenanceMode();

  return (
    <ClerkProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <Suspense fallback={null}>
              <LoadingBar />
            </Suspense>
            {children}
            <GlobalAudioPlayer />
          </Providers>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
