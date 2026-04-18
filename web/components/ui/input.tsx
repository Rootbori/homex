import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl bg-white px-4 text-sm text-on-surface outline-none ring-1 ring-slate-200 transition-all placeholder:text-on-surface-variant/30 focus:bg-white focus:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
