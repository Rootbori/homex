import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const headlineFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atmospheric",
  description: "Mobile-first air service and CRM experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${bodyFont.variable} ${headlineFont.variable}`}>{children}</body>
    </html>
  );
}
