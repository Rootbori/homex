import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, localizeAppPath } from "@/lib/auth-flow";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบร้านและทีมช่าง",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffLoginPage({
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
      initialAccountType="staff"
      heading="ร้าน / ทีมช่าง"
      subtitle="เข้าสู่ระบบก่อน แล้วค่อยเลือกว่าจะสร้างร้านใหม่หรือเข้าร่วมทีม"
      providerAvailability={{
        google: isProviderConfigured("google"),
        line: isProviderConfigured("line"),
      }}
    />
  );
}
