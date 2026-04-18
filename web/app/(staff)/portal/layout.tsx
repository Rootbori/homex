import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell mode="staff">{children}</AppShell>;
}
