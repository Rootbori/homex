import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  redirectTo = "/login",
}: Readonly<{
  className?: string;
  redirectTo?: string;
}>) {
  return (
    <form action={signOutAction} className={cn("inline-block", className)}>
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <button
        type="submit"
        className={cn(
          "interactive-scale group flex h-11 items-center gap-3 rounded-2xl bg-white px-5 text-sm font-bold text-on-surface ring-1 ring-black/[0.05] shadow-soft transition-all hover:shadow-md active:scale-95",
          className
        )}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
          <LogOut className="h-3.5 w-3.5" />
        </div>
        <span>ออกจากระบบ</span>
      </button>
    </form>
  );
}
