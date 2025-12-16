import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
//@ts-expect-error import React from "react";
import "./globals.css";
import Providers from "@/providers";
import { ClerkProviderWrapper } from "@/lib/ClerkProviderWrapper";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";

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
    default: "Fortuna Center Kupang - English & HRD Training",
    template: "%s | Fortuna Center Kupang",
  },
  description:
    "Fortuna English & Human Resources Development (HRD) Training Centre is a distinguished institution in Kupang. We are dedicated to bridging the gap between potential and professional success through comprehensive training programs.",
  keywords: [
    "Fortuna Center",
    "Kupang",
    "English Course",
    "HRD Training",
    "English Training Centre",
    "Fortuna Kupang",
    "Kursus Bahasa Inggris Kupang",
    "Pelatihan HRD",
  ],
  authors: [{ name: "Fortuna Center Team" }],
  creator: "Fortuna Center",
  publisher: "Fortuna Center",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.fortunacenter.com",
    title: "Fortuna Center Kupang - English & HRD Training",
    description:
      "Fortuna English & Human Resources Development (HRD) Training Centre is a distinguished institution in Kupang. We are dedicated to bridging the gap between potential and professional success through comprehensive training programs.",
    siteName: "Fortuna Center Kupang",
    images: [
      {
        url: "/images/og-image.jpg", // We need to ensure this image exists or use a placeholder
        width: 1200,
        height: 630,
        alt: "Fortuna Center Kupang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fortuna Center Kupang - English & HRD Training",
    description:
      "Bridging the gap between potential and professional success through comprehensive training programs in Kupang.",
    images: ["/images/twitter-image.jpg"], // Ensure this exists
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProviderWrapper>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            {children}
            <GlobalAudioPlayer />
          </Providers>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
