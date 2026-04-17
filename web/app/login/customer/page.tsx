import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, redirectForAccountType } from "@/lib/auth-flow";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.accountType) {
    redirect(session.redirectTo ?? redirectForAccountType(session.accountType));
  }

  const params = await searchParams;

  return (
    <LoginForm
      backHref="/login"
      error={params?.error ?? null}
      fixedAccountType="customer"
      heading="ลูกค้าเข้าสู่ระบบ"
      initialAccountType="customer"
      providerAvailability={{
        google: isProviderConfigured("google"),
        line: isProviderConfigured("line"),
      }}
      subtitle="สำหรับผู้ใช้ประเภท customer ที่ต้องการหาช่างแอร์ ส่งคำขอ และติดตามสถานะงานของตัวเอง โดยระบบจะสร้างบัญชีให้อัตโนมัติในครั้งแรก"
    />
  );
}
