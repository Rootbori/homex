import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, redirectForAccountType } from "@/lib/auth-flow";

export default async function UserLoginPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ error?: string }>;
}>) {
  const session = await auth();
  if (session?.accountType) {
    redirect(session.redirectTo ?? redirectForAccountType(session.accountType));
  }

  const params = await searchParams;

  return (
    <LoginForm
      backHref="/login"
      error={params?.error ?? null}
      initialAccountType="user"
      heading="ลูกค้า"
      subtitle="เข้าสู่ระบบหรือสร้างบัญชีใหม่"
      providerAvailability={{
        google: isProviderConfigured("google"),
        line: isProviderConfigured("line"),
      }}
    />
  );
}
