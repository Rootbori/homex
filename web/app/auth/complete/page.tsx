import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCompleteView } from "@/components/auth/auth-complete";
import { redirectForAccountType } from "@/lib/auth-flow";

export default async function AuthCompletePage() {
  const session = await auth();
  if (!session?.accountType) {
    redirect("/login");
  }

  return <AuthCompleteView fallbackPath={redirectForAccountType(session.accountType)} />;
}
