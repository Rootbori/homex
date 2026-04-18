import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured } from "@/lib/auth-flow";

export default async function UserLoginPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ error?: string }>;
}>) {
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
