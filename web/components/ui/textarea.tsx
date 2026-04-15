import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-2xl border-none bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
