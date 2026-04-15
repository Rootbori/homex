import { cn } from "@/lib/utils";

export function Timeline({
  items,
}: {
  items: { label: string; time: string; done: boolean }[];
}) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "z-10 h-4 w-4 rounded-full",
                item.done
                  ? "bg-primary"
                  : index === items.findIndex((entry) => !entry.done)
                    ? "bg-primary ring-4 ring-primary/20"
                    : "border-2 border-[var(--outline-variant)] bg-transparent",
              )}
            />
            {index < items.length - 1 ? (
              <div className={cn("h-10 w-0.5", item.done ? "bg-primary/20" : "bg-outline-variant/30")} />
            ) : null}
          </div>
          <div className="pb-6">
            <p
              className={cn(
                "text-sm font-bold",
                item.done ? "text-on-surface" : "text-on-surface-variant",
              )}
            >
              {item.label}
            </p>
            <p className="text-xs text-on-surface-variant">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
