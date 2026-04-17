import { cn } from "@/lib/utils";

export function Logo({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      className={cn("shrink-0", className)}
    >
      {/* Outer Hexagon representing solid foundation & engineering */}
      <path
        d="M24 4L41.32 14v20L24 44L6.68 34V14L24 4Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M24 4L41.32 14v20L24 44L6.68 34V14L24 4Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Internal H representing 'Homex' */}
      <path
        d="M17 17v14M31 17v14M17 24h14"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Airflow / Cooling accent dots */}
      <circle cx="24" cy="15" r="2.5" fill="currentColor" />
      <circle cx="24" cy="33" r="2.5" fill="currentColor" />
    </svg>
  );
}
