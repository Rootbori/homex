import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "surface-card rounded-[2rem] ambient-shadow",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("p-5 md:p-6", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn("p-5 pb-3 md:p-6 md:pb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  children,
  ...props
}: Readonly<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn("headline-font text-lg font-bold tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  ...props
}: Readonly<HTMLAttributes<HTMLParagraphElement>>) {
  return (
    <p className={cn("text-sm leading-6 text-on-surface-variant", className)} {...props} />
  );
}
