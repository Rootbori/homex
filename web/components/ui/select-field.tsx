import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  id: string;
  label: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ id, label, error, placeholder, options, containerClassName, className, required, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <label htmlFor={id} className={cn("text-xs font-semibold", error ? "text-red-500" : "text-on-surface")}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            id={id}
            ref={ref}
            required={required}
            className={cn(
              "h-12 w-full appearance-none rounded-xl bg-white px-4 pr-10 text-sm text-on-surface outline-none ring-1 transition-all",
              error ? "ring-red-500/50 focus:ring-red-500/50" : "ring-slate-200 focus:ring-primary/20",
              className,
            )}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/40" />
        </div>
        {error ? <p className="text-[11px] font-medium text-red-500">{error}</p> : null}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
