import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  id?: string;
  containerClassName?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, id, containerClassName, className, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200/60 transition-colors hover:bg-slate-50",
          containerClassName
        )}
      >
        <input
          id={id}
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary transition-all focus:ring-primary",
            className
          )}
          {...props}
        />
        <span className="text-xs font-medium text-on-surface">{label}</span>
      </label>
    );
  }
);

CheckboxField.displayName = "CheckboxField";
