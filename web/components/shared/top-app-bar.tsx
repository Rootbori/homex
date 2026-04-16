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
        "glass-bar fixed top-0 z-50 w-full px-5 py-3.5 md:px-6 md:py-4",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between md:max-w-3xl lg:max-w-5xl">
        <div className={cn("flex min-w-0 items-center", left ? "gap-4" : "")}>
          {left}
          <div className="headline-font truncate text-xl font-bold tracking-tight text-primary">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}
