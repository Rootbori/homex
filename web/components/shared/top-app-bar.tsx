import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopAppBar({
  title,
  left,
  right,
  className,
}: {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "glass-bar fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4",
        className,
      )}
    >
      <div className={cn("flex items-center", left ? "gap-4" : "")}>
        {left}
        <div className="headline-font text-xl font-bold tracking-tight text-primary">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
