import { type InputHTMLAttributes, forwardRef } from "react";
import { Input } from "@/components/ui/input";
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
        <Input
          id={id}
          ref={ref}
          required={required}
          className={cn(error ? "ring-red-500/50 focus:ring-red-500/50" : undefined, className)}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
