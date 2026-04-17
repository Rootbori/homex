import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, redirectForAccountType } from "@/lib/auth-flow";

export default async function StaffLoginPage({
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
