import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-primary-fixed-dim text-on-primary-fixed-variant",
        muted: "bg-surface-container-high text-on-surface-variant",
        success: "bg-primary-fixed-dim/40 text-on-primary-fixed-variant",
        warning: "bg-tertiary-fixed text-tertiary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
