import type { ReactNode } from "react";
import { BottomNav } from "@/components/shared/bottom-nav";
import { cn } from "@/lib/utils";

export function AppShell({
  mode,
  children,
  className,
}: {
  mode: "customer" | "staff";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto min-h-screen max-w-md px-0 pb-16">
        <main className={cn("space-y-6", className)}>{children}</main>
      </div>
      <BottomNav mode={mode} />
    </div>
  );
}
