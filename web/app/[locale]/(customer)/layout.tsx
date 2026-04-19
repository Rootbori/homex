import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AppShell mode="user">{children}</AppShell>;
}
