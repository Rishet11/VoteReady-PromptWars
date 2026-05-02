import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VoteReady | Your Election Process Assistant",
  description: "Check your eligibility, registration deadlines, and voting procedures in India seamlessly.",
  keywords: ["Election India", "Voter ID", "EPIC", "ECI", "VoteReady", "Voter Registration"],
  authors: [{ name: "VoteReady Team" }],
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VoteReady",
    "url": siteUrl,
    "applicationCategory": "CivicTechApplication",
    "description": "Independent Indian election process assistant for registration deadlines, eligibility, maps, and post-registration guidance.",
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "isAccessibleForFree": true
  };

  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
