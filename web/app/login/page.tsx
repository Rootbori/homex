import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginTypeChooser } from "@/components/auth/login-form";
import { redirectForAccountType } from "@/lib/auth-flow";

export default async function LoginPage() {
  const session = await auth();
  if (session?.accountType) {
    redirect(session.redirectTo ?? redirectForAccountType(session.accountType));
  }

  return <LoginTypeChooser />;
}
