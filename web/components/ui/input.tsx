import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-14 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
