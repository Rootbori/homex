import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured } from "@/lib/auth-flow";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบร้านและทีมช่าง",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffLoginPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<{ error?: string }>;
}>) {
  const params = await searchParams;

  return (
    <LoginForm
      backHref="/login"
      error={params?.error ?? null}
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
