import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/app-shell";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell mode="customer">{children}</AppShell>;
}
