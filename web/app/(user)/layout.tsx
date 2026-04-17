import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";

export default function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell mode="user">{children}</AppShell>;
}
