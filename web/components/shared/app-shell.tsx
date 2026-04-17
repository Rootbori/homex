import type { ReactNode } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";

export function AppShell({
  mode,
  children,
}: Readonly<{
  mode: "user" | "staff";
  children: ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-white pb-16">
      {children}
      <BottomNav mode={mode} />
    </div>
  );
}
