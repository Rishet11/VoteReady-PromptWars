import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VoteReady | Your Election Process Assistant",
  description: "Check your eligibility, registration deadlines, and voting procedures in India seamlessly.",
  keywords: ["Election India", "Voter ID", "EPIC", "ECI", "VoteReady", "Voter Registration"],
  authors: [{ name: "VoteReady Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans antialiased`}>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
