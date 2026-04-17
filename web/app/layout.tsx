import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
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
  title: "Homex - ร้านรวมช่างแอร์มืออาชีพ",
  description: "ค้นหาช่างแอร์ ติดตามงาน และจัดการนัดหมายได้ง่ายๆ ในที่เดียว",
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
