import { cn } from "@/lib/utils";

export function Avatar({
  label,
  image,
  className,
}: Readonly<{
  label: string;
  image?: string;
  className?: string;
}>) {
  if (image) {
    return (
      <div
        className={cn(
          "h-16 w-16 overflow-hidden rounded-2xl bg-surface-container-high",
          className,
        )}
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-high font-semibold text-primary",
        className,
      )}
    >
      {label.slice(0, 2)}
    </div>
  );
}
