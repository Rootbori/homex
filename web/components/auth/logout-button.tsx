import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/login/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LogoutButton({
  className,
  redirectTo = "/login",
}: {
  className?: string;
  redirectTo?: string;
}) {
  return (
    <form action={signOutAction} className={className}>
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <button className={cn(buttonVariants({ variant: "outline" }), "w-full", className)} type="submit">
        <LogOut className="h-4 w-4" />
        ออกจากระบบ
      </button>
    </form>
  );
}
