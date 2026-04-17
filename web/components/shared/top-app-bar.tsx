import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopAppBar({
  title,
  left,
  right,
  className,
}: Readonly<{
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-black/[0.04] bg-white/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className={cn("flex min-w-0 items-center", left ? "gap-3" : "")}>
          {left}
          <span className="headline-font truncate text-base font-bold text-on-surface">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
