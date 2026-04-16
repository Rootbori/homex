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
    <div className="min-h-screen pb-28 md:pb-10">
      <div className="mx-auto min-h-screen w-full max-w-md px-0 pb-16 md:max-w-3xl md:px-6 lg:max-w-5xl lg:px-8">
        <main className={cn("space-y-5 md:space-y-6", className)}>{children}</main>
      </div>
      <BottomNav mode={mode} />
    </div>
  );
}
