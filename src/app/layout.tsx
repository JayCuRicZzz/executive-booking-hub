import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BellaVillas BKC 100 ล้าน App",
  description: "BellaVillas BKC 100 ล้าน App Dashboard",
  openGraph: {
    title: "BellaVillas BKC 100 ล้าน App",
    description: "BellaVillas BKC 100 ล้าน App Dashboard",
    type: "website",
  },
  twitter: {
    title: "BellaVillas BKC 100 ล้าน App",
    description: "BellaVillas BKC 100 ล้าน App Dashboard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
