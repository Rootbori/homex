import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id, required, error, containerClassName, className, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <label htmlFor={id} className={cn("text-xs font-semibold", error ? "text-red-500" : "text-on-surface")}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            required={required}
            className={cn(
              "w-full rounded-xl bg-white px-4 py-3 text-sm text-on-surface outline-none ring-1 transition-all placeholder:text-on-surface-variant/30 focus:bg-white focus:ring-primary/20",
              error ? "ring-red-500/50 focus:ring-red-500/50" : "ring-slate-200 focus:ring-primary/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
