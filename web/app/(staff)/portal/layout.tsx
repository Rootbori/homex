import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";

export default function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell mode="staff">{children}</AppShell>;
}
