import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, localizeAppPath } from "@/lib/auth-flow";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบลูกค้า",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserLoginPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ error?: string }>;
}>) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  return (
    <LoginForm
      backHref={localizeAppPath("/login", locale)}
      error={query?.error ?? null}
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
