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
  title: "Fortuna Center Kupang",
  description:
    "Fortuna English & Human Resources Development (HRD) Training Centre is a distinguished institution in Kupang. We are dedicated to bridging the gap between potential and professional success through comprehensive training programs.",
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
            {children}
            <GlobalAudioPlayer />
          </Providers>
        </body>
      </html>
    </ClerkProviderWrapper>
  );
}
